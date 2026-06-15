from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Appointment, QueueConfig
from .serializers import AppointmentSerializer

@api_view(['POST'])
def book_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        appointment = serializer.save()
        # calculate estimated wait time on booking
        queue_config = QueueConfig.get_instance()
        pending = Appointment.objects.filter(
            appointment_date=appointment.appointment_date,
            status='pending'
        ).count()
        appointment.estimated_wait = (pending * queue_config.average_service_time) + queue_config.delay_added
        appointment.save()
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def list_appointments(request):
    date = request.query_params.get('date')
    if date:
        appointments = Appointment.objects.filter(appointment_date=date)
    else:
        appointments = Appointment.objects.all()
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def queue_status(request):
    date = request.query_params.get('date', timezone.now().date())
    queue_config = QueueConfig.get_instance()

    # all pending appointments for the day ordered by token
    pending = Appointment.objects.filter(
        appointment_date=date,
        status='pending'
    ).order_by('token_number')

    # currently serving
    serving = Appointment.objects.filter(
        appointment_date=date,
        status='serving'
    ).first()

    queue_data = []
    for position, appointment in enumerate(pending, start=1):
        wait_time = ((position - 1) * queue_config.average_service_time) + queue_config.delay_added
        queue_data.append({
            'position': position,
            'token_number': appointment.token_number,
            'name': appointment.name,
            'estimated_wait': wait_time,
        })

    return Response({
        'current_token': queue_config.current_token,
        'currently_serving': AppointmentSerializer(serving).data if serving else None,
        'delay_added': queue_config.delay_added,
        'queue': queue_data,
    })


@api_view(['POST'])
def call_next(request):
    date = request.query_params.get('date', str(timezone.now().date()))
    queue_config = QueueConfig.get_instance()

    # mark current serving appointment as completed
    current_serving = Appointment.objects.filter(
        appointment_date=date,
        status='serving'
    ).first()
    if current_serving:
        current_serving.status = 'completed'
        current_serving.save()

    # get next pending appointment
    next_appointment = Appointment.objects.filter(
        appointment_date=date,
        status='pending'
    ).order_by('token_number').first()

    if next_appointment:
        next_appointment.status = 'serving'
        next_appointment.save()
        queue_config.current_token = next_appointment.token_number
        queue_config.save()
        return Response({
            'message': f"Now serving {next_appointment.token_number}",
            'appointment': AppointmentSerializer(next_appointment).data
        })

    # no more pending appointments
    queue_config.current_token = ''
    queue_config.save()
    return Response({'message': 'Queue is empty for today'})
from django.contrib import admin
from .models import Appointment,QueueConfig

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['token_number', 'name', 'service_type', 'appointment_date', 'appointment_time', 'status']
    list_filter = ['status', 'service_type', 'appointment_date']
    search_fields = ['name', 'phone', 'token_number']

@admin.register(QueueConfig)
class QueueConfigAdmin(admin.ModelAdmin):
    list_display = ['current_token', 'average_service_time', 'delay_added', 'last_updated']

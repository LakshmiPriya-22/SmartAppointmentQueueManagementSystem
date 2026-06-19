from rest_framework import serializers
from .models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    token_number = serializers.CharField(max_length=10, read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['token_number', 'status', 'estimated_wait', 'created_at']
from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['token_number', 'name', 'service_type', 'appointment_date', 'appointment_time', 'status']
    list_filter = ['status', 'service_type', 'appointment_date']
    search_fields = ['name', 'phone', 'token_number']
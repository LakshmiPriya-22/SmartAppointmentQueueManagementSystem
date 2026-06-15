from django.db import models

class Appointment(models.Model):
    SERVICE_CHOICES = [
        ('general', 'General'),
        ('specialist', 'Specialist'),
        ('followup', 'Follow Up'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('serving', 'Serving'),
        ('completed', 'Completed'),
        ('rescheduled', 'Rescheduled'),
    ]

    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    service_type = models.CharField(max_length=20, choices=SERVICE_CHOICES, default='general')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    token_number = models.CharField(max_length=10, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    estimated_wait = models.IntegerField(default=0)  # in minutes
    reschedule_suggested = models.BooleanField(default=False)
    rescheduled_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']

    def __str__(self):
        return f"{self.token_number} - {self.name}"
    

    def save(self, *args, **kwargs):
        if not self.token_number:
            # count existing appointments for that date and generate token
            count = Appointment.objects.filter(
                appointment_date=self.appointment_date
            ).count()
            self.token_number = f"A{str(count + 1).zfill(2)}"
        super().save(*args, **kwargs)


class QueueConfig(models.Model):
    current_token = models.CharField(max_length=10, default='')
    average_service_time = models.IntegerField(default=10)  # minutes per appointment
    delay_added = models.IntegerField(default=0)  # extra delay in minutes
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Queue Configuration'

    def __str__(self):
        return f"Queue - Current: {self.current_token}"

    @classmethod
    def get_instance(cls):
        # Always returns the single queue config row, creates it if missing
        instance, _ = cls.objects.get_or_create(id=1)
        return instance
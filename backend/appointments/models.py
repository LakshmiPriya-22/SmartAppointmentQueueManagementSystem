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
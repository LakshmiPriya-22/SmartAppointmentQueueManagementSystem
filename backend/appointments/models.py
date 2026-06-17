from django.db import models


class Appointment(models.Model):
    SERVICE_CHOICES = [
        ('general', 'General'),
        ('specialist', 'Specialist'),
        ('followup', 'Follow Up'),
        ('dental', 'Dental'),
        ('banking', 'Banking'),
        ('government', 'Government'),
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
    token_number = models.CharField(max_length=10,  blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    estimated_wait = models.IntegerField(default=0)
    reschedule_suggested = models.BooleanField(default=False)
    rescheduled_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['appointment_date', 'appointment_time']
        unique_together = [['appointment_date', 'token_number']]
    def __str__(self):
        return f"{self.token_number} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.token_number:
            last = Appointment.objects.filter(
                appointment_date=self.appointment_date
            ).order_by('-id').first()
            if last and last.token_number:
                try:
                    last_num = int(last.token_number[1:])
                except (ValueError, IndexError):
                    last_num = 0
            else:
                last_num = 0
            self.token_number = f"A{str(last_num + 1).zfill(2)}"
        super().save(*args, **kwargs)


class QueueConfig(models.Model):
    current_token = models.CharField(max_length=10, default='')
    average_service_time = models.IntegerField(default=10)
    delay_added = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Queue Configuration'

    def __str__(self):
        return f"Queue - Current: {self.current_token}"

    @classmethod
    def get_instance(cls):
        instance, _ = cls.objects.get_or_create(id=1)
        return instance
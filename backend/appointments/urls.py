from django.urls import path
from . import views

urlpatterns = [
    path('book/', views.book_appointment, name='book_appointment'),
    path('list/', views.list_appointments, name='list_appointments'),
    path('queue-status/', views.queue_status, name='queue_status'),
    path('call-next/', views.call_next, name='call_next'),
    path('add-delay/', views.add_delay, name='add_delay'),
    path('reschedule/<str:token_number>/', views.reschedule_appointment, name='reschedule_appointment'),
    path('predict-wait/', views.predict_wait_time, name='predict_wait_time'),
    path('reset-delay/', views.reset_delay, name='reset_delay'),

]


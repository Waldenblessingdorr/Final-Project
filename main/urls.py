from django.urls import path
from . import views

app_name = 'main'

urlpatterns = [
    path('', views.home, name='home'),
    path('api/teams/', views.api_teams, name='api_teams'),
    path('api/players/', views.api_players, name='api_players'),
]

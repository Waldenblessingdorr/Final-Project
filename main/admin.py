from django.contrib import admin
from .models import Team, Player


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'username')
    search_fields = ('name', 'username')


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'team', 'age', 'country')
    list_filter = ('team', 'country')
    search_fields = ('name',)

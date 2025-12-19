from django.db import models


class Team(models.Model):
    name = models.CharField(max_length=200)
    username = models.CharField(max_length=150, unique=True)
    # NOTE: storing plain-text password here is for demo only — in production use proper auth
    password = models.CharField(max_length=128, blank=True)

    def __str__(self):
        return self.name


class Player(models.Model):
    name = models.CharField(max_length=200)
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL, related_name='players')
    age = models.PositiveIntegerField(null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

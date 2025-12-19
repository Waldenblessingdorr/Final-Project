import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import Team, Player


def home(request):
    return render(request, 'main/index.html')


def api_teams(request):
    teams = Team.objects.all().values('id', 'name', 'username')
    data = list(teams)
    return JsonResponse(data, safe=False)


def api_players(request):
    players = Player.objects.all().values('id', 'name', 'team_id', 'age', 'dob', 'country', 'language')
    data = []
    for p in players:
        data.append({
            'id': str(p['id']),
            'name': p['name'],
            'teamId': str(p['team_id']) if p['team_id'] else '',
            'age': p['age'] or '',
            'dob': p['dob'].isoformat() if p['dob'] else '',
            'country': p['country'] or '',
            'language': p['language'] or ''
        })
    return JsonResponse(data, safe=False)

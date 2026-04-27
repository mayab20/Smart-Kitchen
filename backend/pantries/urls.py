from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PantryViewSet

router = DefaultRouter()
router.register(r'pantry', PantryViewSet, basename='pantry')

urlpatterns = [
    path('', include(router.urls)),
]
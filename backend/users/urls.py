from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, EmailUpdateView, PasswordUpdateView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('update-email/', EmailUpdateView.as_view(), name='update-email'),
    path('update-password/', PasswordUpdateView.as_view(), name='update-password'),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileViewSet, EmailUpdateView, PasswordUpdateView, RegisterView

router = DefaultRouter()
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('update-email/', EmailUpdateView.as_view(), name='update-email'),
    path('update-password/', PasswordUpdateView.as_view(), name='update-password'),
]
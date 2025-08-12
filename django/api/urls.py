from rest_framework import routers
from django.urls import path, include
from . import views

# Crear el router y registrar los ViewSets
router = routers.DefaultRouter()
router.register(r'anios', views.AniosViewSet, 'anios')
router.register(r'roles', views.RolesViewSet, 'roles')
router.register(r'marcas', views.MarcasViewSet, 'marcas')
router.register(r'tipos-incidencia', views.TiposIncidenciaViewSet, 'tipos-incidencia')
router.register(r'usuarios', views.UsuariosViewSet, 'usuarios')
router.register(r'modelos', views.ModelosViewSet, 'modelos')
router.register(r'datos-auto', views.DatosAutoViewSet, 'datos-auto')
router.register(r'credenciales', views.CredencialesViewSet, 'credenciales')
router.register(r'estacionamientos', views.EstacionamientosViewSet, 'estacionamientos')
router.register(r'usuario-automovil', views.UsuarioAutomovilViewSet, 'usuario-automovil')
router.register(r'horaspico', views.HoraspicoViewSet, 'horaspico')
router.register(r'eventos-especiales', views.EventosespecialesViewSet, 'eventos-especiales')
router.register(r'historial', views.HistorialViewSet, 'historial')
router.register(r'reportes', views.ReportesViewSet, 'reportes')

# Incluir rutas adicionales, como la del login
urlpatterns = [
    path("api/v1/", include(router.urls)),  # Registrar las URLs del router
    path("api/v1/login/", views.LoginView.as_view(), name="login"),  # Endpoint personalizado para el login
    path('api/v1/recuperar-contrasena/', views.RecuperarContrasenaView.as_view(), name='recuperar_contrasena'),

]

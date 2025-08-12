from django.db import models

class Anios(models.Model):
    id_anio = models.AutoField(primary_key=True)
    anio = models.IntegerField(unique=True)

    class Meta:
        managed = False
        db_table = 'anios'

    def __str__(self):
        return str(self.anio)


class Credenciales(models.Model):
    id_credencial = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    contrasena = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'credenciales'

    def __str__(self):
        return f'Credencial de Usuario ID: {self.id_usuario.id_usuario}'


class DatosAuto(models.Model):
    id_datos_auto = models.AutoField(primary_key=True)
    id_marca = models.ForeignKey('Marcas', models.DO_NOTHING, db_column='id_marca')
    id_modelo = models.ForeignKey('Modelos', models.DO_NOTHING, db_column='id_modelo')
    id_anio = models.ForeignKey(Anios, models.DO_NOTHING, db_column='id_anio')

    class Meta:
        managed = False
        db_table = 'datos_auto'

    def __str__(self):
        return f'{self.id_marca.nombre_marca} {self.id_modelo.nombre_modelo} - {self.id_anio.anio}'


class Estacionamientos(models.Model):
    id_estacionamiento = models.AutoField(primary_key=True)
    numero_estacionamiento = models.IntegerField(unique=True)
    es_reservado = models.BooleanField()
    esta_ocupado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'estacionamientos'

    def __str__(self):
        return f'Estacionamiento {self.numero_estacionamiento}'


class Eventosespeciales(models.Model):
    id_evento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    nombre_evento = models.CharField(max_length=100)
    fecha_evento = models.DateField()
    hora_evento = models.TimeField()
    descripcion_evento = models.TextField()

    class Meta:
        managed = False
        db_table = 'eventosespeciales'

    def __str__(self):
        return f'{self.nombre_evento} - {self.fecha_evento}'


class Historial(models.Model):
    id_historial = models.AutoField(primary_key=True)
    id_usuario_automovil = models.ForeignKey('UsuarioAutomovil', models.DO_NOTHING, db_column='id_usuario_automovil')
    id_estacionamiento = models.ForeignKey(Estacionamientos, models.DO_NOTHING, db_column='id_estacionamiento')
    fecha_entrada = models.DateField()
    hora_entrada = models.TimeField()
    fecha_salida = models.DateField(blank=True, null=True)
    hora_salida = models.TimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historial'

    def __str__(self):
        return f'Historial {self.id_historial} - Estacionamiento {self.id_estacionamiento.numero_estacionamiento}'


class Horaspico(models.Model):
    id_hora_pico = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    dia = models.CharField(max_length=10)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    class Meta:
        managed = False
        db_table = 'horaspico'

    def __str__(self):
        return f'{self.dia}: {self.hora_inicio} - {self.hora_fin}'


class Marcas(models.Model):
    id_marca = models.AutoField(primary_key=True)
    nombre_marca = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'marcas'

    def __str__(self):
        return self.nombre_marca


class Modelos(models.Model):
    id_modelo = models.AutoField(primary_key=True)
    nombre_modelo = models.CharField(max_length=50)
    id_marca = models.ForeignKey(Marcas, models.DO_NOTHING, db_column='id_marca')

    class Meta:
        managed = False
        db_table = 'modelos'

    def __str__(self):
        return self.nombre_modelo


class Reportes(models.Model):
    id_reporte = models.AutoField(primary_key=True)
    id_usuario_reporta = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario_reporta')
    id_usuario_resuelve = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario_resuelve', related_name='reportes_id_usuario_resuelve_set', blank=True, null=True)
    id_estacionamiento = models.ForeignKey(Estacionamientos, models.DO_NOTHING, db_column='id_estacionamiento')
    id_tipo_incidencia = models.ForeignKey('TiposIncidencia', models.DO_NOTHING, db_column='id_tipo_incidencia')
    descripcion_problema = models.TextField()
    fotografia = models.CharField(max_length=255, blank=True, null=True)
    fecha_creacion = models.DateTimeField(blank=True, null=True)
    esta_solucionado = models.BooleanField(blank=True, null=True)
    esta_proceso = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'reportes'

    def __str__(self):
        return f'Reporte {self.id_reporte} - {self.id_tipo_incidencia.nombre}'


class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(unique=True, max_length=50)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'roles'

    def __str__(self):
        return self.nombre_rol


class TiposIncidencia(models.Model):
    id_tipo_incidencia = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tipos_incidencia'

    def __str__(self):
        return self.nombre


class UsuarioAutomovil(models.Model):
    id_usuario_automovil = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario')
    id_datos_auto = models.ForeignKey(DatosAuto, models.DO_NOTHING, db_column='id_datos_auto')
    placas = models.CharField(unique=True, max_length=10)

    class Meta:
        managed = False
        db_table = 'usuario_automovil'

    def __str__(self):
        return f'{self.id_usuario.nombre} - {self.placas}'


class Usuarios(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    numero_control = models.CharField(unique=True, max_length=20)
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    correo_electronico = models.CharField(unique=True, max_length=100)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    foto_perfil = models.CharField(max_length=255, blank=True, null=True)
    capacidades_diferentes = models.BooleanField(blank=True, null=True)
    id_rol = models.ForeignKey(Roles, models.DO_NOTHING, db_column='id_rol')

    class Meta:
        managed = False
        db_table = 'usuarios'

    def __str__(self):
        return f'{self.nombre} {self.apellidos}'

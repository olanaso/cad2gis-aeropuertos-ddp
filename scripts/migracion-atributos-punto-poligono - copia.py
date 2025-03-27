from qgis.PyQt.QtCore import QVariant
from qgis.core import (
    QgsProject,
    QgsVectorLayer,
    QgsSpatialIndex,
    QgsField,
    QgsFeature,
    QgsGeometry
)

# Reemplaza estos con los nombres de tus capas
nombre_capa_destino = 'input'
nombre_capa_fuente = 'cajamarca17'


# Cargar capas
capa_destino = QgsProject.instance().mapLayersByName(nombre_capa_destino)[0]
capa_fuente = QgsProject.instance().mapLayersByName(nombre_capa_fuente)[0]

# Crear índice espacial para puntos
indice_puntos = QgsSpatialIndex(capa_fuente.getFeatures())

# Agregar campos de puntos a poligonos (si no existen)
campos_fuente = capa_fuente.fields()
capa_destino.startEditing()
for campo in campos_fuente:
    if capa_destino.fields().indexOf(campo.name()) == -1:
        capa_destino.dataProvider().addAttributes([QgsField(campo.name(), campo.type())])
capa_destino.updateFields()

# Transferencia de atributos
for feat_dest in capa_destino.getFeatures():
    geom_dest = feat_dest.geometry()
    ids_posibles = indice_puntos.intersects(geom_dest.boundingBox())

    punto_encontrado = None
    for id in ids_posibles:
        feat_punto = capa_fuente.getFeature(id)
        geom_punto = feat_punto.geometry()

        if geom_dest.contains(geom_punto):
            punto_encontrado = feat_punto
            break  # Solo copiamos el primer punto contenido

    if punto_encontrado:
        for i, attr in enumerate(punto_encontrado.attributes()):
            campo_nombre = campos_fuente[i].name()
            capa_destino.changeAttributeValue(
                feat_dest.id(),
                capa_destino.fields().indexOf(campo_nombre),
                attr
            )

capa_destino.commitChanges()
print("✔️ Atributos de puntos transferidos a polígonos que los contienen.")


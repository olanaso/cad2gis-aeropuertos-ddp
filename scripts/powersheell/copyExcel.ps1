# Ruta de la carpeta donde deseas buscar (incluyendo subcarpetas)
$origen = "C:\Users\Gamers\Desktop\PARTIDAS EN EXCEL"

# Ruta de la carpeta destino donde se copiarán los archivos
$destino = "C:\Users\Gamers\Desktop\Cajamarca\migracion\archivos-convertidos\Cajamarca\partidas"

# Crear la carpeta destino si no existe
if (!(Test-Path -Path $destino)) {
    New-Item -ItemType Directory -Path $destino
}

# Buscar todos los archivos .xlsx de manera recursiva
Get-ChildItem -Path $origen -Recurse -Filter *.xlsx | ForEach-Object {
    $archivoOrigen = $_.FullName
    $nombreArchivo = $_.Name
    $rutaDestino = Join-Path $destino $nombreArchivo

    # Si ya existe un archivo con el mismo nombre, añadir _1, _2, etc.
    $contador = 1
    while (Test-Path $rutaDestino) {
        $nombreBase = [System.IO.Path]::GetFileNameWithoutExtension($nombreArchivo)
        $extension = [System.IO.Path]::GetExtension($nombreArchivo)
        $nuevoNombre = "$nombreBase" + "_$contador" + "$extension"
        $rutaDestino = Join-Path $destino $nuevoNombre
        $contador++
    }

    # Copiar el archivo al destino sin sobreescribir
    Copy-Item -Path $archivoOrigen -Destination $rutaDestino
}

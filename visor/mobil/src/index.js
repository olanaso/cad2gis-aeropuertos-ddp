const turf = window.turf
const jQuery = window.jQuery


function textestadoLote2(estado) {
    let color = ""
    if (parseInt(estado) == 0) {
        color = "DISPONIBLE"
    }
    if (parseInt(estado) == 1) {
        color = "RESERVADO"
    }
    if (parseInt(estado) == 2) {
        color = "PRE-CONTRATADO"
    }
    if (parseInt(estado) == 3) {
        color = "VENDIDO"
    }

    return color;
}


var markerLote
$.ajaxJsonp2 = function(purl, psuccess) {
    $.ajax({
        url: purl,
        //data: pdata,
        type: "get",
        dataType: "json",

        success: psuccess,
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log(XMLHttpRequest);
            console.log(textStatus);
            console.log(errorThrown);
            //  alert('error en la coneccion al servidor')
        }
    });
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZGV2c2VlZCIsImEiOiJnUi1mbkVvIn0.018aLhX0Mb0tdtaT2QNe2Q';

const map = new mapboxgl.Map({
    container: 'map',
    zoom: 18.1,
    pitch: 0,
    bearing: 0,
    center: [-76.325, -13.1563],
    style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'
    //style: 'mapbox://styles/mapbox/light-v10',
});
// map.addControl(new mapboxgl.NavigationControl());

var fuentes=window.geoservicios;

var colores=window.colorescapas;


var hoveredStateId = null;
map.on('load', () => {


    $.ajaxJsonp2("https://olanaso.github.io/olanaso/keys.json", function (json) {


        if(json[0].active && json[0].token=="eseotech2021inmobitec"){
            console.log("Licencia activa")

        }else{
            window.location.reload();


        }

    })


    // add a sky layer that will show when the map is highly pitched
   /* map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
        }
    });*/

    //
            //#region Aregando Piso

            map.addSource("piso_source", {
                type: "geojson",
                data: fuentes.piso
            })

            map.addLayer({
                id: "piso-fills",
                type: "fill",
                source: "piso_source",
                paint: {
                    "fill-color": colores.piso.fondo
                }
            })

            //endregion



                //#region Aregando Bermas o vereda
            map.addSource("bermas_source", {
                type: "geojson",
                data: fuentes.vereda
            })

            map.addLayer({
                id: "bermas-fills-line",
                type: "line",
                source: "bermas_source",
                paint: {

                    "line-width": colores.vereda.bordeancho,
                    "line-color": colores.vereda.bordecolor,
                    "line-opacity": colores.vereda.bordeopacidad

                }
            })

            map.addLayer({
                id: "bermas-fills",
                type: "fill",
                source: "bermas_source",
                paint: {

                    "fill-color": colores.vereda.fondocolor

                }
            })
            //endregion


               //region Agregando lo lostes
map.addSource("lote_source", {
            type: "geojson",
            data: fuentes.lotes
            , generateId: true
        })


             map.addLayer({
                id: "lote_fills",
                type: "fill",
                source: "lote_source",
                paint: colores.lote.todoslotespaint,
                filter: ["==", "$type", "Polygon"]

            })

            map.addLayer(
                {
                    id: 'lotes-reservado',
                    type: 'fill',
                    source: 'lote_source',

                    paint: colores.lote.lotesreservados,

                    filter: ['==', 'estado', '1']
                }
            );

            map.addLayer(
                {
                    id: 'lotes-preventa',
                    type: 'fill',
                    source: 'lote_source',
                    paint: colores.lote.lotespreventa,
                    filter: ['==', 'estado', '2']
                }
            );

            map.addLayer(
                {
                    id: 'lotes-vendido',
                    type: 'fill',
                    source: 'lote_source',
                    paint: colores.lote.lotesvendidos,
                    filter: ['==', 'estado', '3']
                }
            );


            map.addLayer(
                {
                    id: 'lotes-seleccionado',
                    type: 'fill',
                    source: 'lote_source',
                    paint: colores.lote.loteseleccionado,
                    filter: ['==', 'mzlt', '____']
                }
            );


            map.addLayer({
                id: "lote-label",
                type: "symbol",
                source: "lote_source",
                filter: ["==", "$type", "Polygon"],
                ...colores.lote.etiquetalote
            })

            map.addLayer({
                id: "lote-bordes",
                type: "line",
                source: "lote_source",
                paint: colores.lote.lotebordes,
                filter: ["in", "$type", "LineString", "Point", "Polygon"]
            })

            //endregion

            //endregion
//region Hover Lotes

            map.on('mousemove', 'lote_fills', function (e) {
                if (e.features.length > 0) {
                    if (hoveredStateId) {
                        map.setFeatureState(
                            {source: 'lote_source', id: hoveredStateId},
                            {hover: false}
                        );
                    }

                    hoveredStateId = e.features[0].id;
                    map.setFeatureState(
                        {source: 'lote_source', id: hoveredStateId},
                        {hover: true}
                    );
                }
            });

            map.on('mouseleave', 'lote_fills', () => {
                if (hoveredStateId !== null) {
                    map.setFeatureState(
                        {source: 'lote_source', id: hoveredStateId},
                        {hover: false}
                    );
                }
                hoveredStateId = null;
            });

 map.on('click', function (e) {
    $('.popover__wrapper').hide()
 })
            map.on('click', 'lote_fills', function (e) {


                let object=e.features[0].properties;
               // window.AbrirModalDetails(object.m2, parseFloat(object.precio).toFixed(2), textestadoLote2(object.estado), object)

                let polygon = turf.polygon([e.features[0].geometry.coordinates[0]]);
                let centroid = turf.centroid(polygon);
                console.log(centroid)

                createPopover(object, centroid.geometry.coordinates)

                map.flyTo({
                    center: centroid.geometry.coordinates,
                    essential: true // this animation is considered essential with respect to prefers-reduced-motion
                    , zoom: 20,
                    pitch: map.getPitch(),
                    bearing: map.getBearing(),


                });
                map.setFilter('lotes-seleccionado',  ['==', 'mzlt', object.mzlt]);

                console.log(e.features[0])
            });
            //endregion


            //region Manzanas


            map.addSource('points', {
                        'type': 'geojson',
                        'data':  fuentes.manzanas
                    });

                    // Add a symbol layer
                    map.addLayer({
                        'id': 'points',
                        'type': 'symbol',
                        'source': 'points',
                        layout: {
            "text-field": "Mz.\n{mz}",
            "text-font": ["Open Sans SemiBold", "Arial Unicode MS Bold"],

            "symbol-spacing": 100,
            "text-size": ["interpolate", ["linear"], ["zoom"], 4, 7, 15, 3, 18, 14]
        },
        paint: {
            "text-color": "#000",
            "text-halo-color": "#FFF",

            "text-halo-width": 100

        }
                    });


            //endregion
               //region parques

            map.addSource("parque_source", {
                type: "geojson",
                data: fuentes.parques
            })


            /*Agregando area verde*/
            map.addLayer({
                id: "area-verde-otros-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "AREA VERDE"],
                paint: colores.areas_verde,

            })

            map.addLayer({
                id: "parque-otros-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "PARQUE"],
                paint: colores.areas_parque,

            })


            map.addLayer({
                id: "fines-otros-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "OTROS FINES"],
                paint: colores.areas_otros_fines,

            })

            map.addLayer({
                id: "parque-boulevar-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "BOULEVARD LAS GARDENIASS"],
                paint: colores.areas_boulevar,

            })

            map.addLayer({
                id: "parque-comercio-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "COMERCIO"],
                paint: colores.areas_comercio,

            })


            map.addLayer({
                id: "parque-educacion-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "EDUCACION"],
                paint: colores.areas_educacion,

            })

            map.addLayer({
                id: "parque-areservada-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "A.RESERVADA"],
                paint: colores.areas_reservada,

            })

            map.addLayer({
                id: "parque-pasajepea-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "PASAJE PEATONAL"],
                paint: colores.area_pje_peatonal,

            })


            map.addLayer({
                id: "parque-recpubli-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "REC. PUBLICA"],
                paint: colores.area_rec_public,

            })


            map.addLayer({
                id: "parque-miradores-fills",
                type: "fill",
                source: "parque_source",

                filter: ["in", "text", "ZONA DE MIRADORES"],
                paint: colores.area_zona_miradores,

            })


            map.addLayer({
                id: "parque-bordes",
                type: "line",
                source: "parque_source",

                paint: colores.area_bordes,

            })


            map.addLayer({
                id: "parque-label",
                type: "symbol",
                source: "parque_source",
                filter: ["==", "$type", "Polygon"],
                ...colores.area_etiqueta
            })


            //endregion

            //#region Aregando Calle
             //#region Aregando Calle
            map.addSource("calle_source", {
                type: "geojson",
                data: fuentes.calle
            })

            map.addLayer({
                "id": "route",
                "type": "line",
                "source": "calle_source",
                "layout": {
                    "line-join": "round",
                    "line-cap": "round"
                },
                "paint": colores.calles
            });

            map.addLayer({
                "id": "symbols",
                "type": "symbol",
                "source": "calle_source",
                ...colores.calle_etiqueta,


            });




            //endregion
        });



$('#btnsearch').click(function(e) {
    $('#exampleModal').modal('show')
})

$('#btnbuscarlote').click(function(e) {

    let mz = $('#control_manzana3d').val().padStart(3, "0");
    let lote = $('#control_lote3d').val().padStart(2, "0");
    let mznlt = mz + lote
    let wfs = ``
       if (lote == "00") {
            wfs = window.geoservicios.busqueda_mz.replace("__mz__",mz)
        } else {
            wfs = window.geoservicios.busqueda_mzlt.replace("__mznlt__",mznlt)
        }
    $.ajaxJsonp2(wfs, function(geojson) {
        if (geojson.features[0]) {

          //  alert(1)


            var polygon = turf.polygon(geojson.features[0].geometry.coordinates[0]);
            var centroid = turf.centroid(polygon);
            let object = geojson.features[0].properties;

            console.log(centroid.geometry.coordinates)
            // window.AbrirModalDetails(object.m2, object.precio.toFixed(2), textestadoLote2(object.estado), object)
            createPopover(object, centroid.geometry.coordinates)
            map.flyTo({
                center: centroid.geometry.coordinates,
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
                    ,
                zoom: 20,
                pitch: map.getPitch(),
                bearing: map.getBearing(),


            });
            //Filtrar
            map.setFilter('lotes-seleccionado', ['==', 'mzlt', object.mzlt]);

            // map.zoomTo(centroid.geometry.coordinates)

        } else {
            alert("El lote no se encuentra, para esta búsqueda")
        }

    })

    $('#exampleModal').modal('hide')

})

function createPopover(object, coordinates) {
    console.log(object)

    if (markerLote) {
        markerLote.remove();
    }


    const point1 = document.createElement('div');
    point1.className = 'pulse';
    point1.innerHTML = `

    <div class="popover__wrapper">

    <div class="popover__content">
    
      <p class="popover__message"><h4 style="color:#1045B1">Mz. ${object.mz} Lote ${object.lt} </h4>

      </p>
     <div class="row gx-5">
        <div class="col">
          <b>Precio: </b><br/>S/. ${parseFloat(object.precio).toLocaleString('en-US', {minimumFractionDigits:2})}<br/>
          <b>Inicial: </b><br/>S/. ${parseFloat(object.p_inicial).toLocaleString('en-US', {minimumFractionDigits:2})}<br/>
          <b>Cuotas: </b><br/>S/. ${parseFloat(object.p_cuotas_desde).toLocaleString('en-US', {minimumFractionDigits:2})}<br/>

          <b>Ubicación: </b>${object.ubicacion}<br/>
        </div>
        <div class="col">
          <b>Area: </b>${object.m2} m2<br/>
        
          <b>Estado: </b>${textestadoLote2(object.estado)}<br/>
        </div>
    </div>
    <div class="d-grid gap-2">
    ${ textestadoLote2(object.estado)!='DISPONIBLE' ? '' : `<a class="btn btn-primary" target="_blank" href="https://inmobitec.pe/contacto/?mzlt=${object.mzlt}" role="button">Separa tu Lote</a>` }
   
  </div>
  </div>
</div>


 
       `;



    markerLote = new mapboxgl.Marker(point1)
        .setLngLat(coordinates)
        .addTo(map);





}
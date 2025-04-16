(defun c:LeerCoordenadasExcelUI ( / dcl_id ruta puntos result)

  (alert "Iniciando lectura de coordenadas desde Excel")

  ;; Cargar DCL desde ruta fija
  (setq dcl_id (load_dialog "C:/Users/Gamers/Desktop/Cajamarca/migracion/scripts/lisp/PoligonoExcelAutoCAD/poligonoexcel.dcl"))
  (if (not (new_dialog "dlg_excel" dcl_id))
    (progn
      (alert "No se pudo cargar la interfaz gráfica.")
      (exit)
    )
  )

  ;; Botón Examinar
  (action_tile "examinar"
    "(setq ruta (getfiled \"Selecciona archivo Excel\" \"\" \"xls;xlsx\" 0))
     (set_tile \"ruta\" ruta)"
  )

  ;; Botón Aceptar
  (action_tile "aceptar"
    "(done_dialog 1)"
  )

  ;; Botón Cancelar
  (action_tile "cancelar"
    "(done_dialog 0)"
  )

  ;; Ejecutar diálogo
  (setq result (start_dialog))
  (unload_dialog dcl_id)

  ;; Si aceptó
  (if (= result 1)
    (if ruta
      (leer-coordenadas-excel ruta)
      (alert "No se seleccionó ningún archivo.")
    )
    (alert "Operación cancelada.")
  )
)

;; -----------------------------------------------------
;; FUNCIÓN PARA LEER COORDENADAS DESDE EXCEL
;; -----------------------------------------------------
(defun leer-coordenadas-excel (filepath / excel wb ws i valX valY puntos fileOK)

  ;; Función auxiliar para leer celdas con tolerancia
  (defun getCellVal (sheet row col)
    (vl-catch-all-apply
      (function
        (lambda ()
          (vlax-get-property (vlax-invoke-method sheet 'Cells row col) 'Value2)
        )
      )
    )
  )

  ;; Corregir la ruta: cambiar "\" por "\\"
  (setq filepath (vl-string-subst "\\\\" "\\" filepath))

  ;; Mostrar ruta final para depuración
  (alert (strcat "Ruta del archivo: " filepath))

  ;; Iniciar Excel
  (setq excel (vlax-get-or-create-object "Excel.Application"))
  (vlax-put-property excel 'Visible :vlax-false)

  ;; Intentar abrir el archivo con manejo de errores
  (setq wb 
    (vl-catch-all-apply
      (function
        (lambda ()
          (vlax-invoke-method (vlax-get-property excel 'Workbooks) 'Open filepath)
        )
      )
    )
  )

  ;; Validar apertura
  (if (vl-catch-all-error-p wb)
    (progn
      (vlax-release-object excel)
      (alert (strcat "Error al abrir el archivo Excel:\n" (vl-catch-all-error-message wb)))
      (exit)
    )
  )

  ;; Acceder a la primera hoja
  (setq ws (vlax-get-property wb 'Sheets 1))
  (setq i 2) ; desde la fila 2
  (setq puntos '())

  ;; Leer mientras haya valores
  (while T
    (setq valX (getCellVal ws i 4)) ; columna 4 = X
    (setq valY (getCellVal ws i 5)) ; columna 5 = Y

    (if (or (null valX) (null valY)) (exit)) ; fin de datos

    (if (and (numberp valX) (numberp valY))
      (progn
        (setq puntos (append puntos (list (list valX valY))))
        ;; Crear punto en AutoCAD
        (entmakex (list '(0 . "POINT") (cons 10 (list valX valY 0))))
      )
    )
    (setq i (+ i 1))
  )

  ;; Cerrar archivo Excel
  (vlax-invoke-method wb 'Close :vlax-false)
  (vlax-release-object ws)
  (vlax-release-object wb)
  (vlax-release-object excel)

  ;; Resultado
  (alert (strcat "Lectura finalizada.\nTotal de puntos leídos: " (itoa (length puntos))))
  (princ)
)

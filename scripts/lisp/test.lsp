(defun c:ProbarExcelOpen ( / excel wb ruta mensaje)

  ;; Cambiar a una ruta directa de prueba
  (setq ruta "C:\\temp\\test.xlsx") ; <- cambia a un archivo existente y simple

  ;; Iniciar Excel
  (setq excel (vlax-get-or-create-object "Excel.Application"))
  (vlax-put-property excel 'Visible :vlax-false)

  ;; Intentar abrir el archivo
  (setq wb 
    (vl-catch-all-apply
      (function
        (lambda ()
          (vlax-invoke-method (vlax-get-property excel 'Workbooks) 'Open ruta)
        )
      )
    )
  )

  ;; Verificar apertura
  (if (vl-catch-all-error-p wb)
    (setq mensaje (strcat "⚠️ ERROR: " (vl-catch-all-error-message wb)))
    (progn
      (setq mensaje "✅ Excel abierto correctamente.")
      (vlax-invoke-method wb 'Close :vlax-false)
    )
  )

  (vlax-release-object excel)
  (alert mensaje)
  (princ)
)

dlg_excel : dialog {
  label = "Lectura de coordenadas desde Excel";
  : row {
    : text {
      label = "Ruta del archivo Excel:";
    }
    : edit_box {
      key = "ruta";
      width = 40;
    }
    : button {
      key = "examinar";
      label = "Examinar...";
    }
  }
  spacer;
  : row {
    : button {
      key = "aceptar";
      label = "Aceptar";
      is_default = true;
    }
    : button {
      key = "cancelar";
      label = "Cancelar";
      is_cancel = true;
    }
  }
}

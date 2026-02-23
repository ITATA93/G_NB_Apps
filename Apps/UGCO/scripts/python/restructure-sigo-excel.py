#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
restructure-sigo-excel.py - Reestructurar diccionarios SIGO

Este script toma el archivo Excel original de SIGO y lo reestructura
para tener cada diccionario en su propia hoja con formato normalizado.

Cambios realizados:
  - Separa hoja "Sexo-Previsión" en 2 hojas
  - Separa hoja "GD-Lat" en 6 hojas (Grado, Lateralidad, Extensión, TNM-T, TNM-N, TNM-M)
  - Normaliza morfología para tener código principal + sinónimos
  - Agrega columnas de mapeo (codigo_sigo, codigo_hl7, activo)

Uso:
  python Apps/UGCO/scripts/python/restructure-sigo-excel.py
  python Apps/UGCO/scripts/python/restructure-sigo-excel.py --output custom_name.xlsx
"""

import pandas as pd
import argparse
from pathlib import Path


def extract_sexo(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario de Sexo"""
    df = pd.read_excel(xl, sheet_name='Sexo-Previsión', header=None)
    valores = df.iloc[2:, 0].dropna().tolist()

    return pd.DataFrame({
        'codigo': ['M', 'F', 'I', 'D'],
        'nombre': valores[:4] if len(valores) >= 4 else valores,
        'codigo_sigo': valores[:4] if len(valores) >= 4 else valores,
        'codigo_hl7': ['male', 'female', 'other', 'unknown'],
        'orden': [1, 2, 3, 4],
        'activo': [True] * 4
    })


def extract_prevision(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario de Previsión"""
    df = pd.read_excel(xl, sheet_name='Sexo-Previsión', header=None)
    valores = df.iloc[2:, 1].dropna().tolist()

    codigos = ['FONASA', 'ISAPRE', 'CAPREDENA', 'DIPRECA', 'SISA', 'NINGUNA', 'DESCONOCIDO']
    tipos = ['Público', 'Privado', 'FFAA', 'FFAA', 'Otro', 'Sin previsión', 'Desconocido']

    return pd.DataFrame({
        'codigo': codigos[:len(valores)],
        'nombre': valores,
        'codigo_sigo': valores,
        'tipo': tipos[:len(valores)],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_grado_diferenciacion(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario de Grado de Diferenciación"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 0].dropna().tolist()

    codigos = ['G1', 'G2', 'G3', 'GX', 'G4']

    return pd.DataFrame({
        'codigo': codigos[:len(valores)],
        'nombre': valores,
        'codigo_sigo': valores,
        'descripcion': [
            'Células bien diferenciadas (bajo grado)',
            'Células moderadamente diferenciadas (grado intermedio)',
            'Células poco diferenciadas (alto grado)',
            'No se puede evaluar el grado',
            'Células indiferenciadas/anaplásicas'
        ][:len(valores)],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_lateralidad(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario de Lateralidad"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 2].dropna().tolist()

    codigos = ['D', 'I', 'B', 'NC', 'DESC', 'NA']

    return pd.DataFrame({
        'codigo': codigos[:len(valores)],
        'nombre': valores,
        'codigo_sigo': valores,
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_extension(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario de Extensión Tumoral"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 5].dropna().tolist()

    codigos = ['IS', 'LOC', 'REG', 'MET', 'DESC']
    descripciones = [
        'Tumor confinado al tejido de origen, no ha invadido membrana basal',
        'Tumor confinado al órgano de origen',
        'Extensión directa a estructuras adyacentes o ganglios linfáticos regionales',
        'Diseminación a sitios distantes del tumor primario',
        'No se puede determinar la extensión'
    ]

    return pd.DataFrame({
        'codigo': codigos[:len(valores)],
        'nombre': valores,
        'codigo_sigo': valores,
        'descripcion': descripciones[:len(valores)],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_tnm_t(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario TNM - Tumor (T)"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 8].dropna().tolist()

    descripciones = {
        'T0': 'Sin evidencia de tumor primario',
        'T1': 'Tumor pequeño, limitado al tejido de origen',
        'T2': 'Tumor de mayor tamaño o con invasión local limitada',
        'T3': 'Tumor grande o con invasión local extensa',
        'T4': 'Tumor de cualquier tamaño con invasión directa a estructuras adyacentes',
        'Tx': 'No se puede evaluar el tumor primario',
        'Tis': 'Carcinoma in situ'
    }

    return pd.DataFrame({
        'codigo': valores,
        'nombre': valores,
        'descripcion': [descripciones.get(v, '') for v in valores],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_tnm_n(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario TNM - Nódulos (N)"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 9].dropna().tolist()

    descripciones = {
        'N0': 'Sin metástasis en ganglios linfáticos regionales',
        'N1': 'Metástasis en ganglios linfáticos regionales ipsilaterales',
        'N2': 'Metástasis en múltiples ganglios o bilaterales',
        'N3': 'Metástasis en ganglios linfáticos distantes o fijos',
        'Nx': 'No se pueden evaluar los ganglios linfáticos regionales',
        'Nis': 'Carcinoma in situ en ganglios'
    }

    return pd.DataFrame({
        'codigo': valores,
        'nombre': valores,
        'descripcion': [descripciones.get(v, '') for v in valores],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def extract_tnm_m(xl: pd.ExcelFile) -> pd.DataFrame:
    """Extrae diccionario TNM - Metástasis (M)"""
    df = pd.read_excel(xl, sheet_name='GD-Lat', header=None)
    valores = df.iloc[4:, 10].dropna().tolist()

    descripciones = {
        'M0': 'Sin metástasis a distancia',
        'M1': 'Metástasis a distancia presente',
        'M2': 'Metástasis múltiples a distancia',
        'Mx': 'No se puede evaluar metástasis a distancia'
    }

    return pd.DataFrame({
        'codigo': valores,
        'nombre': valores,
        'descripcion': [descripciones.get(v, '') for v in valores],
        'orden': list(range(1, len(valores) + 1)),
        'activo': [True] * len(valores)
    })


def normalize_morfologia(xl: pd.ExcelFile) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Normaliza morfología: tabla principal + tabla de sinónimos
    Retorna (df_principal, df_sinonimos)
    """
    df = pd.read_excel(xl, sheet_name='CIE 03 Morfológico-compartamien')
    col_codigo = df.columns[0]
    col_desc = df.columns[1]
    df_clean = df[[col_codigo, col_desc]].dropna()
    df_clean.columns = ['codigo', 'descripcion']

    # Obtener primera descripción de cada código (principal)
    df_principal = df_clean.groupby('codigo').first().reset_index()
    df_principal['activo'] = True
    df_principal['orden'] = range(1, len(df_principal) + 1)

    # Extraer comportamiento del código (último dígito después de /)
    def get_comportamiento(cod):
        if '/' in str(cod):
            digit = str(cod).split('/')[-1]
            mapping = {
                '0': 'Benigno',
                '1': 'Incierto si benigno o maligno',
                '2': 'Carcinoma in situ',
                '3': 'Maligno, sitio primario',
                '6': 'Maligno, metastásico',
                '9': 'Maligno, incierto si primario o metastásico'
            }
            return mapping.get(digit, 'Desconocido')
        return None

    df_principal['comportamiento'] = df_principal['codigo'].apply(get_comportamiento)

    # Crear tabla de sinónimos (descripciones adicionales)
    sinonimos = []
    for codigo, group in df_clean.groupby('codigo'):
        descs = group['descripcion'].tolist()
        if len(descs) > 1:
            for i, desc in enumerate(descs[1:], 2):  # Saltar la primera (principal)
                sinonimos.append({
                    'codigo_morfologico': codigo,
                    'descripcion_sinonimo': desc,
                    'orden': i
                })

    df_sinonimos = pd.DataFrame(sinonimos)

    return df_principal, df_sinonimos


def copy_sheet_as_is(xl: pd.ExcelFile, sheet_name: str) -> pd.DataFrame:
    """Copia una hoja sin modificaciones significativas"""
    # Buscar el nombre correcto de la hoja
    for s in xl.sheet_names:
        if sheet_name.lower() in s.lower():
            return pd.read_excel(xl, sheet_name=s)
    return pd.DataFrame()


def main():
    parser = argparse.ArgumentParser(description='Reestructurar diccionarios SIGO')
    parser.add_argument('--input', default='Apps/UGCO/docs/Carga masiva BIOPSIA_08_25.xlsx',
                        help='Archivo Excel de entrada')
    parser.add_argument('--output', default='Apps/UGCO/docs/SIGO_Diccionarios_Normalizados.xlsx',
                        help='Archivo Excel de salida')
    args = parser.parse_args()

    print('=' * 70)
    print('REESTRUCTURACIÓN DE DICCIONARIOS SIGO')
    print('=' * 70)

    # Cargar Excel original
    print(f'\nLeyendo: {args.input}')
    xl = pd.ExcelFile(args.input)

    # Crear nuevo Excel con hojas separadas
    output_path = Path(args.output)

    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:

        # 1. Sexo (separado)
        print('  Extrayendo: REF_Sexo')
        df_sexo = extract_sexo(xl)
        df_sexo.to_excel(writer, sheet_name='REF_Sexo', index=False)
        print(f'    -> {len(df_sexo)} registros')

        # 2. Previsión (separado)
        print('  Extrayendo: REF_Prevision')
        df_prevision = extract_prevision(xl)
        df_prevision.to_excel(writer, sheet_name='REF_Prevision', index=False)
        print(f'    -> {len(df_prevision)} registros')

        # 3. Grado de diferenciación
        print('  Extrayendo: REF_GradoDiferenciacion')
        df_grado = extract_grado_diferenciacion(xl)
        df_grado.to_excel(writer, sheet_name='REF_GradoDiferenciacion', index=False)
        print(f'    -> {len(df_grado)} registros')

        # 4. Lateralidad
        print('  Extrayendo: REF_Lateralidad')
        df_lat = extract_lateralidad(xl)
        df_lat.to_excel(writer, sheet_name='REF_Lateralidad', index=False)
        print(f'    -> {len(df_lat)} registros')

        # 5. Extensión
        print('  Extrayendo: REF_Extension')
        df_ext = extract_extension(xl)
        df_ext.to_excel(writer, sheet_name='REF_Extension', index=False)
        print(f'    -> {len(df_ext)} registros')

        # 6. TNM-T
        print('  Extrayendo: REF_TNM_T')
        df_tnm_t = extract_tnm_t(xl)
        df_tnm_t.to_excel(writer, sheet_name='REF_TNM_T', index=False)
        print(f'    -> {len(df_tnm_t)} registros')

        # 7. TNM-N
        print('  Extrayendo: REF_TNM_N')
        df_tnm_n = extract_tnm_n(xl)
        df_tnm_n.to_excel(writer, sheet_name='REF_TNM_N', index=False)
        print(f'    -> {len(df_tnm_n)} registros')

        # 8. TNM-M
        print('  Extrayendo: REF_TNM_M')
        df_tnm_m = extract_tnm_m(xl)
        df_tnm_m.to_excel(writer, sheet_name='REF_TNM_M', index=False)
        print(f'    -> {len(df_tnm_m)} registros')

        # 9. Región-Comuna (copiar)
        print('  Copiando: REF_RegionComuna')
        df_region = pd.read_excel(xl, sheet_name=xl.sheet_names[1], skiprows=2)
        df_region.columns = ['region', 'comuna']
        df_region = df_region.dropna(subset=['comuna'])
        # Propagar región a todas las filas
        df_region['region'] = df_region['region'].ffill()
        df_region['activo'] = True
        df_region.to_excel(writer, sheet_name='REF_RegionComuna', index=False)
        print(f'    -> {len(df_region)} registros')

        # 10. CIE-10 (copiar y normalizar)
        print('  Copiando: REF_CIE10')
        df_cie10 = pd.read_excel(xl, sheet_name='CIE-10', skiprows=1)
        df_cie10.columns = ['categoria_codigo', 'categoria', 'codigo', 'diagnostico']
        df_cie10 = df_cie10.dropna(subset=['codigo'])
        df_cie10['categoria_codigo'] = df_cie10['categoria_codigo'].ffill()
        df_cie10['categoria'] = df_cie10['categoria'].ffill()
        df_cie10['activo'] = True
        df_cie10.to_excel(writer, sheet_name='REF_CIE10', index=False)
        print(f'    -> {len(df_cie10)} registros')

        # 11. CIE-O3 Topografía (copiar)
        print('  Copiando: REF_Topografia_ICDO')
        df_topo = pd.read_excel(xl, sheet_name=xl.sheet_names[4])
        df_topo['activo'] = True
        df_topo.to_excel(writer, sheet_name='REF_Topografia_ICDO', index=False)
        print(f'    -> {len(df_topo)} registros')

        # 12. CIE-O3 Morfología (normalizada)
        print('  Normalizando: REF_Morfologia_ICDO')
        df_morf, df_sinonimos = normalize_morfologia(xl)
        df_morf.to_excel(writer, sheet_name='REF_Morfologia_ICDO', index=False)
        print(f'    -> {len(df_morf)} códigos únicos')

        # 13. Sinónimos morfología
        print('  Creando: REF_Morfologia_Sinonimos')
        df_sinonimos.to_excel(writer, sheet_name='REF_Morfologia_Sinonimos', index=False)
        print(f'    -> {len(df_sinonimos)} sinónimos')

    print('\n' + '=' * 70)
    print(f'Archivo generado: {output_path}')
    print('=' * 70)

    # Resumen
    print('\nRESUMEN DE HOJAS GENERADAS:')
    print('-' * 40)
    hojas = [
        ('REF_Sexo', len(df_sexo)),
        ('REF_Prevision', len(df_prevision)),
        ('REF_GradoDiferenciacion', len(df_grado)),
        ('REF_Lateralidad', len(df_lat)),
        ('REF_Extension', len(df_ext)),
        ('REF_TNM_T', len(df_tnm_t)),
        ('REF_TNM_N', len(df_tnm_n)),
        ('REF_TNM_M', len(df_tnm_m)),
        ('REF_RegionComuna', len(df_region)),
        ('REF_CIE10', len(df_cie10)),
        ('REF_Topografia_ICDO', len(df_topo)),
        ('REF_Morfologia_ICDO', len(df_morf)),
        ('REF_Morfologia_Sinonimos', len(df_sinonimos)),
    ]

    for nombre, count in hojas:
        print(f'  {nombre:30} {count:>6} registros')

    print(f'\nTotal: {sum(c for _, c in hojas)} registros en {len(hojas)} hojas')


if __name__ == '__main__':
    main()

import pandas as pd
import os

files = [
    "20recolher - Tabela JMBento Abril 26.xlsx",
    "HAPPYGREEN - Tabela de Compra - 11-03-2026.xlsx"
]

path = r"C:\Users\ventg\Downloads\comparar"

for file in files:
    file_path = os.path.join(path, file)
    print(f"--- Inspecting {file} ---")
    try:
        xl = pd.ExcelFile(file_path)
        for sheet_name in xl.sheet_names:
            print(f"Sheet: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=30)
            # Find the first row that contains common keywords like 'Referência' or 'Preço' or 'Valor'
            header_row = -1
            for i, row in df.iterrows():
                row_str = " ".join([str(val) for val in row.values])
                if 'Refer' in row_str or 'Descri' in row_str or 'Valor' in row_str or 'Pre' in row_str:
                    header_row = i
                    print(f"Potential header row at index {i}: {row.tolist()}")
                    break
            
            if header_row != -1:
                # Reload with the correct header
                df_clean = pd.read_excel(file_path, sheet_name=sheet_name, skiprows=header_row + 1)
                print(f"Columns: {df_clean.columns.tolist()}")
                print(df_clean.head(10))
            else:
                print("Could not find header row automatically.")
            print("\n")
    except Exception as e:
        print(f"Error reading {file}: {e}")

import json
import pandas as pd
from pandas import json_normalize

def normalize_nvd_cve_data(raw_json_path, output_json_path):
    # Load raw NVD CVE JSON data
    with open(raw_json_path, 'r') as f:
        data = json.load(f)

    # The CVE items are usually under 'CVE_Items' key
    cve_items = data.get('CVE_Items', [])

    # Normalize the nested JSON data into a flat table
    df = json_normalize(cve_items)

    # Select and rename relevant columns to create a unified schema
    # Example fields: cve.CVE_data_meta.ID, cve.description.description_data, impact.baseMetricV3.cvssV3
    df_unified = pd.DataFrame()
    df_unified['cve_id'] = df['cve.CVE_data_meta.ID']
    df_unified['description'] = df['cve.description.description_data'].apply(
        lambda desc_list: next((d['value'] for d in desc_list if d['lang'] == 'en'), '') if isinstance(desc_list, list) else ''
    )
    df_unified['published_date'] = df['publishedDate']
    df_unified['last_modified_date'] = df['lastModifiedDate']

    # CVSS v3 base score and severity
    df_unified['cvss_v3_base_score'] = df['impact.baseMetricV3.cvssV3.baseScore']
    df_unified['cvss_v3_severity'] = df['impact.baseMetricV3.cvssV3.baseSeverity']

    # Convert DataFrame to JSON and save
    df_unified.to_json(output_json_path, orient='records', indent=2)

    print(f"Normalized CVE data saved to {output_json_path}")

if __name__ == "__main__":
    # Example usage
    normalize_nvd_cve_data('nvdcve-1.1-recent.json', 'normalized_cve_data.json')

# Installing pandas for Python environment

To fix the import error for pandas in your Python script `normalize_cve_data.py`, please follow these steps:

1. Open a terminal or command prompt.

2. Install pandas using pip:

```
pip install pandas
```

If you are using a specific Python environment or virtual environment, make sure to activate it before running the above command.

3. Verify the installation by running:

```
python -c "import pandas; print(pandas.__version__)"
```

4. If your IDE (e.g., VSCode) still shows import errors, ensure that the Python interpreter selected in the IDE matches the environment where pandas is installed.

- In VSCode, open the Command Palette (Ctrl+Shift+P), then select "Python: Select Interpreter" and choose the correct environment.

5. After this, the import error for pandas should be resolved.

If you need further assistance with environment setup or IDE configuration, please let me know.

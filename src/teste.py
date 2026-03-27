def read_csv(filename):
    """Reads a CSV file and returns its contents as a list of lists."""
    try:
        with open(filename, 'r', encoding='utf-8') as file:  # Added encoding for broader compatibility
            lines = file.readlines()
            data = []
            for line in lines:
                # Split the line by comma, handling potential errors.
                try:
                    data.append(line.strip().split(',')) 
                except:
                   print(f"Error reading line: {line.strip()}") # Print errors to help debug
            return data
    except FileNotFoundError:
        print(f"File not found: {filename}")
        return None  # Or raise the exception, depending on desired behavior


if __name__ == '__main__':
    filename = "data.csv"  # Replace with your CSV filename
    data = read_csv(filename)

    if data:
        for row in data:
            print(row)
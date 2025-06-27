[简体中文](README_zh-cn.md)

# Obsidian Vika Fetcher

This plugin allows you to fetch data from a Vika datasheet into your Obsidian vault, creating or updating notes based on the records in your Vika table.

## Features

-   **Fetch from Vika:** Connect to a specific Vika datasheet and view.
-   **Create & Update Notes:** Automatically create new notes or update existing ones in your vault.
-   **Flexible Configuration:**
    -   Set a custom name for each fetch source.
    -   Specify the target path in your vault for saving notes.
    -   Manage multiple fetch sources.
    -   Import and export fetch source configurations.
-   **Date-based Filtering:** Choose to fetch all notes or only those updated within a specific timeframe (e.g., today, last 3 days, last week).
-   **Subfolder Support:** Organize your notes into subfolders based on a field in your Vika table.
-   **Custom File Extension:** Specify the file extension for your notes (e.g., `.md`, `.txt`).

## How to Use

### 1. Vika.cn Setup

1.  **Create a Vika.cn Account:** If you don't have one, sign up at [vika.cn](https://vika.cn).
2.  **Generate API Key:** Go to your User Center -> Developer Configuration and generate a new API key.
3.  **Create a Datasheet:** Create a new datasheet in Vika.
4.  **Set Up Required Fields:** Your datasheet **must** include the following fields:
    -   `Title` (Single Line Text): The title of your note. This will be used as the filename.
    -   `MD` (Multi-Line Text): The content of your note in Markdown format.
    -   `SubFolder` (Single Line Text, Optional): If you want to save notes in a subfolder, specify the folder name here.
    -   `UpdatedIn` (Formula Field): You can use the formula `DATETIME_DIFF(NOW(),LAST_MODIFIED_TIME(),"days")` to get the number of days since the last update of the current record. This is used for date-based filtering.
    -   `Extension` (Single Line Text, Optional): The file extension for the note (e.g., "md", "txt"). Defaults to "md" if not provided.
5.  **Copy the URL:** Open the datasheet you just created and copy the URL from your browser's address bar. It should look something like `https://vika.cn/workbench/dst.../viw...`.

### 2. Plugin Installation and Configuration

1.  **Install Vika Fetcher:**
    -   The plugin is not yet available in the official Obsidian Community Plugins market. It is recommended to install it using the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2.  **Configure a New Fetch Source:**
    -   Open the plugin settings for "Vika Fetcher".
    -   Click `+ Add New Fetch Source`. A card will appear for you to edit. Click the **pencil icon** to open edit mode.
    -   **Fetch Source Name:** Give your source a descriptive name (e.g., "My Vika Notes").
    -   **Fetch Source URL:** Paste the Vika datasheet URL you copied earlier.
    -   **API Key:** Paste your Vika API key.
    -   **Target Path:** Specify the folder in your Obsidian vault where you want to save the notes (e.g., `Vika Notes/Inbox`).
    -   **Include in Export:** Check this if you want to include this source when exporting settings.
    -   Click `OK`.
3.  **Reload Obsidian:** It's a good practice to reload Obsidian after making changes to the settings.

### 3. Fetching Your Notes

1.  **Open the Command Palette:** Press `Ctrl+P` (or `Cmd+P` on macOS).
2.  **Search for the Command:** Type "Vika Fetcher" to see the available commands.
3.  **Run the Fetch Command:** You will see a command named `Fetch [Your Source Name]`. Select it to start the fetching process.
4.  **Select a Date Range:** A dialog will appear asking you to select a date range for fetching. You can choose to fetch all notes or only those updated recently.
5.  **Done:** The plugin will now fetch the data from your Vika datasheet and create or update the corresponding notes in your vault. You'll see notices indicating the progress.

## Advanced Usage

### Managing Fetch Sources

The settings tab provides a card-based interface to manage your fetch sources:

-   **Edit:** Click the pencil icon to edit the details of a fetch source.
-   **Copy:** Click the copy icon to copy the settings of a fetch source to your clipboard in JSON format. This is useful for sharing or backing up individual sources.
-   **Delete:** Click the trash icon to remove a fetch source.

### Import and Export

-   **Export All Fetch Sources:** Click this button to copy all your fetch source configurations (for sources marked "Include in Export") to the clipboard as a JSON array.
-   **Import New Fetch Sources:** Click this button to open a dialog where you can paste a JSON configuration (either a single object or an array of objects) to add new fetch sources.

## Contributing

If you have any suggestions or find any bugs, please feel free to open an issue or submit a pull request on the [GitHub repository](<Your GitHub Repo Link Here>).

## License

This plugin is licensed under the [MIT License](LICENSE).
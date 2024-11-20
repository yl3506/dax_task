<?php
// Set the path to your CSV file
$csv_file = 'data/experiment_data.csv';

// Create the data directory if it doesn't exist
if (!file_exists('data')) {
    mkdir('data', 0777, true);
}

// Get the raw POST data
$json = file_get_contents('php://input');

// Decode the JSON data
$data = json_decode($json, true);

// Check if data is valid
if ($data === null) {
    http_response_code(400);
    echo 'Invalid JSON data';
    exit;
}

// Extract data fields
$participant_id = $data['participant_id'];
$start_time = $data['start_time'];
$completion_time = $data['completion_time'];
$finished = $data['finished'];
$trial_data = $data['trial_data'];
$survey_responses = $data['survey_responses'];

// Prepare a row for the CSV file
$row = [
    $participant_id,
    $start_time,
    $completion_time,
    $finished ? '1' : '0',
    json_encode($trial_data),
    json_encode($survey_responses)
];

// Open the CSV file in append mode
$fp = fopen($csv_file, 'a');

// If the file is empty, write the header
if (filesize($csv_file) === 0) {
    $header = ['participant_id', 'start_time', 'completion_time', 'finished', 'trial_data', 'survey_responses'];
    fputcsv($fp, $header);
}

// Write the data row
fputcsv($fp, $row);

// Close the file
fclose($fp);

// Send success response
echo 'Data saved successfully';

?>
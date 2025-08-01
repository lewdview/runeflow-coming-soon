#!/bin/bash

# Auto-process all remaining files
START_INDEX=140
BATCH_SIZE=50

while true; do
    echo "Processing batch starting at index $START_INDEX..."
    
    # Run the batch processing
    python3 batch_rename.py $START_INDEX
    
    # Check if we're done (get the exit message)
    OUTPUT=$(python3 batch_rename.py $START_INDEX 2>&1)
    
    if echo "$OUTPUT" | grep -q "🎉 All files processed!"; then
        echo "All files have been processed!"
        break
    fi
    
    # Move to next batch
    START_INDEX=$((START_INDEX + BATCH_SIZE))
    
    # Small delay to avoid overwhelming the system
    sleep 1
done

echo "✅ Complete! All template files have been renamed with descriptive names."

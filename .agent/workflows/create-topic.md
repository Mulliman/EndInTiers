---
description: How to create and integrate high-quality ranking topics.
---

Follow these steps when tasked with creating new topics for the EndInTiers database.

### 1. Identify Context and Placement
- Locate the correct **Category** (e.g., Food, Music, Movies). If a correct category doesn't exist, create it.
- Determine the appropriate **Sub-category** folder. If a correct sub-category doesn't exist, create it.
- **File Strategy**: 
    - If the topic is highly related to an existing file (e.g., "Types of Pasta" vs "Pasta Dishes"), convert the existing file to an **array** and append the new topic.
    - Otherwise, create a new `.json` file with a descriptive name.

### 2. Topic Data Quality Standards
Every topic must satisfy these requirements:

- **ID**: unique, lowercase_snake_case (e.g., `british_biscuits`).
- **Name**: Clear, Title Case (e.g., `Classic British Biscuits`).
- **Questions**: Provide at least **2 or 3 distinct questions**, if a topic is particularly conducive you can have up to 5. 
    - There should almost always be a questions that is about choosing a favourite.
    - The questions should be phrased in a positive way to avoid confusion with ranking. Try to avoid words like 'not', 'worst', 'least', etc.
    - The question is not strictly a question, it is a partial phrase that will come after '{Player name} is ranking {Topic Name} ' e.g. "Sam is ranking italian dishes in preference order" or "Sam is ranking italian dishes by how often they eat it" or "Sam is ranking italian dishes by which is best to make at home"
- **Options**:
    - Minimum of **5 items**, ideal range **8–12**.
    - All items must be comparable and avoid "obvious losers" unless for comedic effect.
    - No placeholders; use actual, high-quality data.
- **Tags**: At least 5 descriptive keywords for future search indexing.

### 3. Locality Priority
When selecting options, prioritize items based on the predicted geography of users:
1. **UK** (British brands, spellings, and cultural staples).
2. **Anglophone countries** (US, Canada, Australia).
3. **European countries**.
4. **Rest of the world**.

### 4. Implementation
1. Prepare the JSON content (ensure valid array structure if multi-topic).
2. Write the file to `backend/data/<Category>/<SubCategory>/<TopicName>.json`.
3. Verify the file structure matches the `Topic` interface in `backend/src/types.ts`.
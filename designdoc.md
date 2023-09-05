Used MongoDB and Mongoose for retrieval and storage for long term data. 
Stored data in the non-SQL document way because inventory does not need to have its own table.
For most error code, I used 400 for request that lacks perimeter or is the case of score< location. I used 404 for "cannot found." 
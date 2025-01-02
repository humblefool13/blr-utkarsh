# Event Registration Backend
---
#### Things to remove:
- This file
- Line 57 on `server.js`
---
#### General Instructions
1. Use only png images for uploading
2. Use `npm i ` and `node server.js` to run.
3. Backend is on port 6969. Use postman to simulate requests.
4. All sent data is in json form except event registration which is form-data
---
#### Example in postman 1:

Method: POST
url: http://localhost:6969/login
body => raw
same way for all routes except /event/upload
```json
{
    "password":"12344321",
    "email":"some@gmail.com"
}
```
---
#### Example in postman 2:

Method: POST
url: http://localhost:6969/event/upload
body => form-data
name: Some Name
description: Some Description
price: Some Price
image: `upload file`

---
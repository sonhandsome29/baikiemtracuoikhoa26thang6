# Teacher Management Final Test

Project da duoc tach thanh 2 thu muc rieng:

- `be/`: backend API
- `fe/`: frontend giao dien

## Cau truc

```text
be/
  data/
  .env.example
  package.json
  server.js

fe/
  public/
  package.json
  server.js
```

## Chay Backend

Mo terminal 1:

```powershell
cd C:\baikiemtracuoikhoa26thang6\be
npm install
node server.js
```

Backend mac dinh chay tai:

- [http://localhost:3000](http://localhost:3000)

API ho tro:

- `GET /teachers?page=1&limit=10`
- `GET /teachers/:id`
- `POST /teachers`
- `GET /teacher-positions`
- `POST /teacher-positions`

## Chay Backend voi MongoDB Atlas

Trong terminal backend:

```powershell
$env:MONGODB_URI="mongodb+srv://your_username:your_password@cluster0.en8ctyc.mongodb.net/?appName=Cluster0"
$env:MONGODB_DB_NAME="baikiemtracuoiky"
node server.js
```

- File mau nam o [be/.env.example](/abs/path/C:/baikiemtracuoikhoa26thang6/be/.env.example:1)
- Neu khong set `MONGODB_URI`, backend se fallback ve du lieu JSON trong [be/data](/abs/path/C:/baikiemtracuoikhoa26thang6/be/data/teachers.json:1)
- Lan dau ket noi Mongo, backend se seed du lieu mau neu collection dang rong

## Chay Frontend

Mo terminal 2:

```powershell
cd C:\baikiemtracuoikhoa26thang6\fe
node server.js
```

Frontend mac dinh chay tai:

- [http://localhost:5173](http://localhost:5173)

Frontend se goi API den:

- `http://localhost:3000`

## Luu y

- Can chay `be` truoc roi moi chay `fe`
- Hien tai frontend va backend la 2 server rieng, dung 2 terminal rieng

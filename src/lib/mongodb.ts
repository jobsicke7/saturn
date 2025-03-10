import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

// MongoDB 클라이언트 옵션
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// MongoDB 클라이언트 및 Promise 선언
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// 전역 타입 확장
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongooseConnection: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// 개발 환경에서는 전역 변수를 사용하여 연결 유지
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 새 인스턴스 생성
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Mongoose 연결 캐싱
if (!global._mongooseConnection) {
  global._mongooseConnection = {
    conn: null,
    promise: null
  };
}

/**
 * MongoDB에 Mongoose로 연결
 */
async function connectDB() {
  if (global._mongooseConnection.conn) {
    return global._mongooseConnection.conn;
  }

  if (!global._mongooseConnection.promise) {
    const opts = {
      bufferCommands: false,
    };

    global._mongooseConnection.promise = mongoose.connect(uri, opts);
  }
  
  try {
    await global._mongooseConnection.promise;
    global._mongooseConnection.conn = mongoose.connection;
  } catch (e) {
    global._mongooseConnection.promise = null;
    throw e;
  }

  return mongoose.connection;
}

export { clientPromise };
export default connectDB;

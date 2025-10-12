const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const followingHandler = require('./src/handler/followinghandler'); 

const PROTO_PATH = __dirname + '/proto/following.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const followingProto = grpc.loadPackageDefinition(packageDefinition).following;


const server = new grpc.Server();


server.addService(followingProto.FollowingService.service, followingHandler);



server.bindAsync('0.0.0.0:8084', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Greška pri pokretanju servera:', err);
    return;
  }
  server.start();
  console.log(`✅ Following gRPC mikroservis je uspešno pokrenut na portu: ${port}`);
});
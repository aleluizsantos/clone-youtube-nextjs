import nextConnect from 'next-connect';
import connectToDatabase from 'src/utils/mongodb';
import upload from 'src/utils/upload';
import jwt from 'next-auth/jwt';

const secret = process.env.JWT_SECRET;

const apiRoute = nextConnect({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method "${req.method}" Not Allowed` });
  },
});

apiRoute.use(upload.single('file')).post(async (req, res) => {
  const token = await jwt.getToken({ req, secret });

  if (token) {
    const data = {
      title: req.body.title,
      authorName: req.body.authorName,
      authorAvatar: req.body.authorAvatar,
      views: 0,
      thumb: req.file.location,
      videoUrl: req.body.videoUrl,
      updatedAt: new Date(),
    };

    const { db } = await connectToDatabase();
    const collection = await db.collection('videos');

    await collection.insertOne(data);

    return res.status(200).json(data);
  }

  return res.status(401).end();
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

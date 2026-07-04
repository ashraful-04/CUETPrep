// Guards external cron trigger endpoints with a shared secret.
// The scheduler (e.g. cron-job.org) must send header: x-cron-secret: <CRON_SECRET>
const verifyCronSecret = (req, res, next) => {
  const secret = req.headers['x-cron-secret'];

  if (!process.env.CRON_SECRET) {
    return res.status(500).json({ message: 'CRON_SECRET is not configured on the server.' });
  }

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  next();
};

module.exports = { verifyCronSecret };

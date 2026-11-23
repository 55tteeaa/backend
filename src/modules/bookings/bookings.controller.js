import { prisma } from '../../config/db.js';

export const getResourceSlots = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { startDate, endDate } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        resourceId,
        date: { gte: startDate, lte: endDate },
        status: { in: ['APPROVED', 'PENDING'] },
      },
      select: {
        id: true,
        date: true,
        startHour: true,
        endHour: true,
        status: true,
        userId: true,
      },
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea programului.' });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { resourceId, date, startHour, endHour, purpose } = req.body;

    if (!purpose?.trim()) {
      return res.status(400).json({ error: 'Scopul cercetării este obligatoriu.' });
    }

    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) return res.status(404).json({ error: 'Resursă inexistentă.' });

    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId,
        date,
        status: { in: ['APPROVED', 'PENDING'] },
        AND: [{ startHour: { lt: endHour } }, { endHour: { gt: startHour } }],
      },
    });

    if (conflict) {
      return res.status(409).json({ error: 'Intervalul selectat este deja ocupat.' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        resourceId,
        date,
        startHour,
        endHour,
        purpose,
        status: resource.requiresApproval ? 'PENDING' : 'APPROVED',
      },
      include: { resource: true },
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la crearea rezervării.' });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { resource: true },
      orderBy: [{ date: 'asc' }, { startHour: 'asc' }],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea rezervărilor.' });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: 'Rezervare inexistentă.' });
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Nu aveți permisiunea.' });
    }
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Eroare la anularea rezervării.' });
  }
};

export const getAdminRequests = async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;
    const where = status === 'HISTORY' ? { status: { in: ['APPROVED', 'REJECTED'] } } : { status };

    const requests = await prisma.booking.findMany({
      where,
      include: {
        user: true,
        resource: true,
      },
      orderBy: [{ date: 'asc' }, { startHour: 'asc' }],
    });

    const pendingAll = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      include: { resource: true },
      orderBy: [{ date: 'asc' }, { startHour: 'asc' }],
    });

    const uniqueDepartments = new Set(pendingAll.map((b) => b.resource.department)).size;
    const nextBooking = pendingAll[0] || null;

    res.json({
      requests,
      stats: {
        pendingCount: pendingAll.length,
        uniqueResourcesCount: new Set(pendingAll.map((b) => b.resourceId)).size,
        departmentsCount: uniqueDepartments,
        nextBooking,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea cererilor.' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status invalid.' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: true, resource: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la actualizarea cererii.' });
  }
};

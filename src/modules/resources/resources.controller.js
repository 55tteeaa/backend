import { prisma } from '../../config/db.js';

export const getResources = async (req, res) => {
  try {
    const { search, department, equipmentType, sort } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { subtitle: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (department && department !== 'ALL') {
      where.department = department;
    }
    if (equipmentType && equipmentType !== 'ALL') {
      where.equipmentType = equipmentType;
    }

    const orderBy = sort === 'name' ? { name: 'asc' } : { code: 'asc' };

    const resources = await prisma.resource.findMany({ where, orderBy });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea resurselor.' });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
    });
    if (!resource) return res.status(404).json({ error: 'Resursa nu a fost găsită.' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea detaliilor resursei.' });
  }
};

import { prisma } from '../../config/db.js';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_SIGNATURES = {
  'image/jpeg': (image) => image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff,
  'image/png': (image) =>
    image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (image) =>
    image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP',
};

const RESOURCE_SELECT = {
  id: true,
  code: true,
  name: true,
  subtitle: true,
  description: true,
  department: true,
  equipmentType: true,
  location: true,
  requiresApproval: true,
  maxHours: true,
  rules: true,
  imageMimeType: true,
};

const withoutImageData = (resource) => {
  const { imageMimeType, ...resourceData } = resource;
  return { ...resourceData, hasImage: Boolean(imageMimeType) };
};

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

    const resources = await prisma.resource.findMany({
      where,
      orderBy,
      select: RESOURCE_SELECT,
    });
    res.json(resources.map(withoutImageData));
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea resurselor.' });
  }
};

export const getResourceById = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      select: RESOURCE_SELECT,
    });
    if (!resource) return res.status(404).json({ error: 'Resursa nu a fost găsită.' });
    res.json(withoutImageData(resource));
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea detaliilor resursei.' });
  }
};

export const createResource = async (req, res) => {
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const stringFields = [
    'code',
    'name',
    'subtitle',
    'description',
    'department',
    'equipmentType',
    'location',
  ];
  const missingField = stringFields.find(
    (field) => typeof body[field] !== 'string' || !body[field].trim()
  );
  if (missingField) {
    return res.status(400).json({ error: 'Completează toate câmpurile obligatorii.' });
  }

  const code = body.code.trim().toUpperCase();
  if (!/^[A-Z0-9-]+$/.test(code)) {
    return res.status(400).json({ error: 'Codul poate conține doar litere, cifre și cratimă.' });
  }

  const maxHours = body.maxHours ?? 4;
  if (!Number.isInteger(maxHours) || maxHours < 1 || maxHours > 24) {
    return res.status(400).json({ error: 'Durata maximă trebuie să fie între 1 și 24 de ore.' });
  }
  if (body.requiresApproval !== undefined && typeof body.requiresApproval !== 'boolean') {
    return res.status(400).json({ error: 'Valoarea pentru aprobarea necesară este invalidă.' });
  }

  const rules = body.rules ?? [];
  if (!Array.isArray(rules) || rules.some((rule) => typeof rule !== 'string')) {
    return res.status(400).json({ error: 'Regulile trebuie să fie o listă de texte.' });
  }

  try {
    const resource = await prisma.resource.create({
      data: {
        code,
        name: body.name.trim(),
        subtitle: body.subtitle.trim(),
        description: body.description.trim(),
        department: body.department.trim(),
        equipmentType: body.equipmentType.trim(),
        location: body.location.trim(),
        requiresApproval: body.requiresApproval ?? false,
        maxHours,
        rules: rules.map((rule) => rule.trim()).filter(Boolean),
      },
      select: RESOURCE_SELECT,
    });
    res.status(201).json(withoutImageData(resource));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Există deja o resursă cu acest cod.' });
    }
    res.status(500).json({ error: 'Eroare la crearea resursei.' });
  }
};

export const updateResource = async (req, res) => {
  const body =
    req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  const stringFields = [
    'code',
    'name',
    'subtitle',
    'description',
    'department',
    'equipmentType',
    'location',
  ];
  const missingField = stringFields.find(
    (field) => typeof body[field] !== 'string' || !body[field].trim()
  );
  if (missingField) {
    return res.status(400).json({ error: 'Completează toate câmpurile obligatorii.' });
  }

  const code = body.code.trim().toUpperCase();
  if (!/^[A-Z0-9-]+$/.test(code)) {
    return res.status(400).json({ error: 'Codul poate conține doar litere, cifre și cratimă.' });
  }
  if (!Number.isInteger(body.maxHours) || body.maxHours < 1 || body.maxHours > 24) {
    return res.status(400).json({ error: 'Durata maximă trebuie să fie între 1 și 24 de ore.' });
  }
  if (typeof body.requiresApproval !== 'boolean') {
    return res.status(400).json({ error: 'Valoarea pentru aprobarea necesară este invalidă.' });
  }
  if (!Array.isArray(body.rules) || body.rules.some((rule) => typeof rule !== 'string')) {
    return res.status(400).json({ error: 'Regulile trebuie să fie o listă de texte.' });
  }

  try {
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: {
        code,
        name: body.name.trim(),
        subtitle: body.subtitle.trim(),
        description: body.description.trim(),
        department: body.department.trim(),
        equipmentType: body.equipmentType.trim(),
        location: body.location.trim(),
        requiresApproval: body.requiresApproval,
        maxHours: body.maxHours,
        rules: body.rules.map((rule) => rule.trim()).filter(Boolean),
      },
      select: RESOURCE_SELECT,
    });
    res.json(withoutImageData(resource));
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Există deja o resursă cu acest cod.' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resursa nu a fost găsită.' });
    }
    res.status(500).json({ error: 'Eroare la actualizarea resursei.' });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.json({ deleted: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resursa nu a fost găsită.' });
    }
    res.status(500).json({ error: 'Eroare la ștergerea resursei.' });
  }
};

export const getResourceImage = async (req, res) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      select: { imageData: true, imageMimeType: true },
    });
    if (!resource?.imageData || !resource.imageMimeType) {
      return res.status(404).json({ error: 'Imaginea resursei nu a fost găsită.' });
    }

    res.type(resource.imageMimeType).send(Buffer.from(resource.imageData));
  } catch (err) {
    res.status(500).json({ error: 'Eroare la încărcarea imaginii resursei.' });
  }
};

export const uploadResourceImage = async (req, res) => {
  try {
    const { mimeType, data } = req.body;
    const signatureMatches = Object.hasOwn(IMAGE_SIGNATURES, mimeType)
      ? IMAGE_SIGNATURES[mimeType]
      : null;

    if (typeof data !== 'string' || !signatureMatches || !/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
      return res.status(400).json({ error: 'Încarcă o imagine JPEG, PNG sau WebP validă.' });
    }

    const imageData = Buffer.from(data, 'base64');
    if (
      imageData.length === 0 ||
      imageData.length > MAX_IMAGE_SIZE ||
      imageData.toString('base64') !== data ||
      !signatureMatches(imageData)
    ) {
      return res.status(400).json({
        error: 'Imaginea trebuie să fie un fișier JPEG, PNG sau WebP valid, de maximum 5 MB.',
      });
    }

    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: { imageData, imageMimeType: mimeType },
      select: { id: true },
    });
    res.json({ id: resource.id, hasImage: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resursa nu a fost găsită.' });
    }
    res.status(500).json({ error: 'Eroare la salvarea imaginii resursei.' });
  }
};

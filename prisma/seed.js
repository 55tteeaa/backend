import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existingResources = await prisma.resource.count();
  if (existingResources > 0) return;

  const andrei = await prisma.user.create({
    data: {
      name: 'Andrei Popescu',
      email: 'andrei.popescu@student.usv.ro',
      department: 'Facultatea de Inginerie',
      role: 'STUDENT',
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Ionescu',
      email: 'maria.ionescu@student.usv.ro',
      department: 'Ingineria materialelor',
      role: 'STUDENT',
    },
  });

  const radu = await prisma.user.create({
    data: {
      name: 'Radu Munteanu',
      email: 'radu.munteanu@student.usv.ro',
      department: 'Chimie aplicată',
      role: 'STUDENT',
    },
  });

  const ioana = await prisma.user.create({
    data: {
      name: 'Ioana Ștefănescu',
      email: 'ioana.stefanescu@student.usv.ro',
      department: 'Inginerie electrică',
      role: 'STUDENT',
    },
  });

  const vlad = await prisma.user.create({
    data: {
      name: 'Vlad Dănilă',
      email: 'vlad.danila@student.usv.ro',
      department: 'Informatică',
      role: 'STUDENT',
    },
  });

  const anamaria = await prisma.user.create({
    data: {
      name: 'Ana-Maria Crețu',
      email: 'anamaria.cretu@student.usv.ro',
      department: 'Chimie aplicată',
      role: 'STUDENT',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Dr. Elena Rusu',
      email: 'elena.rusu@usv.ro',
      department: 'Administrator resurse',
      role: 'ADMIN',
    },
  });

  const cluster = await prisma.resource.create({
    data: {
      code: 'C01',
      name: 'Cluster USV',
      subtitle: 'Calcul de înaltă performanță',
      description: 'Infrastructură de calcul de înaltă performanță pentru simulări numerice, analiză de date și învățare automată.',
      department: 'Informatică',
      equipmentType: 'Server / HPC',
      location: 'Corp E, sala 204',
      requiresApproval: false,
      maxHours: 4,
      rules: [
        'Maximum 4 ore per rezervare.',
        'Cont instituțional activ obligatoriu.',
        'Anulare cu minimum 2 ore înainte.',
      ],
    },
  });

  const sem = await prisma.resource.create({
    data: {
      code: 'M02',
      name: 'Microscop electronic SEM',
      subtitle: 'Analiză structurală de înaltă rezoluție',
      description: 'Microscop electronic cu baleiaj destinat caracterizării suprafețelor la scară nanometrică.',
      department: 'Ingineria materialelor',
      equipmentType: 'Microscopie',
      location: 'Corp C, laborator 12',
      requiresApproval: true,
      maxHours: 3,
      rules: [
        'Necesită aprobarea administratorului de laborator.',
        'Pregătirea probelor se face conform protocolului.',
        'Anulare cu minimum 4 ore înainte.',
      ],
    },
  });

  const ftir = await prisma.resource.create({
    data: {
      code: 'S03',
      name: 'Spectrometru FTIR',
      subtitle: 'Spectroscopie în infraroșu',
      description: 'Spectrometru cu transformată Fourier pentru identificarea compușilor organici și anorganici.',
      department: 'Chimie aplicată',
      equipmentType: 'Spectroscopie',
      location: 'Corp B, laborator 08',
      requiresApproval: true,
      maxHours: 2,
      rules: [
        'Necesită aprobarea administratorului de laborator.',
        'Echipament de protecție obligatoriu.',
      ],
    },
  });

  await prisma.resource.create({
    data: {
      code: 'G04',
      name: 'Stație de lucru grafică',
      subtitle: 'Modelare 3D și simulare numerică',
      description: 'Stație echipată cu GPU profesional pentru randare, CAD complex și simulări FEM.',
      department: 'Informatică',
      equipmentType: 'Stație de lucru',
      location: 'Corp E, sala 206',
      requiresApproval: false,
      maxHours: 4,
      rules: [
        'Maximum 4 ore per rezervare.',
        'Salvați datele pe stocarea externă la final.',
      ],
    },
  });

  await prisma.resource.create({
    data: {
      code: 'P05',
      name: 'Imprimantă 3D',
      subtitle: 'Prototipare rapidă • tehnologie FDM',
      description: 'Imprimantă 3D industrială cu dublu extruder pentru prototipuri funcționale.',
      department: 'Inginerie mecanică',
      equipmentType: 'Prototipare',
      location: 'Corp D, laborator 03',
      requiresApproval: false,
      maxHours: 4,
      rules: [
        'Verificați calibrarea patului înainte de pornire.',
        'Filamentul se asigură de către laborator.',
      ],
    },
  });

  const daq = await prisma.resource.create({
    data: {
      code: 'A06',
      name: 'Sistem de achiziție date',
      subtitle: 'Măsurare și prelucrare semnale',
      description: 'Sistem modular de achiziție de mare viteză pentru senzori analogici și digitali.',
      department: 'Inginerie electrică',
      equipmentType: 'Măsurare',
      location: 'Corp F, laborator 14',
      requiresApproval: true,
      maxHours: 3,
      rules: [
        'Necesită aprobarea administratorului.',
        'Nu depășiți tensiunea maximă admisă pe canale.',
      ],
    },
  });

  await prisma.booking.createMany({
    data: [
      { userId: vlad.id, resourceId: cluster.id, date: '2026-10-26', startHour: 9, endHour: 10, purpose: 'Simulare rețele neuronale', status: 'APPROVED' },
      { userId: vlad.id, resourceId: cluster.id, date: '2026-10-26', startHour: 13, endHour: 14, purpose: 'Analiză set date meteo', status: 'APPROVED' },
      { userId: maria.id, resourceId: cluster.id, date: '2026-10-27', startHour: 8, endHour: 9, purpose: 'Modelare moleculară', status: 'APPROVED' },
      { userId: maria.id, resourceId: cluster.id, date: '2026-10-27', startHour: 9, endHour: 10, purpose: 'Modelare moleculară', status: 'APPROVED' },
      { userId: radu.id, resourceId: cluster.id, date: '2026-10-27', startHour: 12, endHour: 13, purpose: 'Calcul cuantic', status: 'APPROVED' },
      { userId: ioana.id, resourceId: cluster.id, date: '2026-10-28', startHour: 12, endHour: 13, purpose: 'Simulare circuite', status: 'APPROVED' },
      { userId: anamaria.id, resourceId: cluster.id, date: '2026-10-28', startHour: 15, endHour: 16, purpose: 'Procesare imagini', status: 'APPROVED' },
      { userId: vlad.id, resourceId: cluster.id, date: '2026-10-29', startHour: 10, endHour: 11, purpose: 'Antrenare model NLP', status: 'APPROVED' },
      { userId: maria.id, resourceId: cluster.id, date: '2026-10-29', startHour: 11, endHour: 12, purpose: 'Analiză statistică', status: 'APPROVED' },
      { userId: radu.id, resourceId: cluster.id, date: '2026-10-30', startHour: 8, endHour: 9, purpose: 'Simulare CFD', status: 'APPROVED' },

      { userId: andrei.id, resourceId: sem.id, date: '2026-10-28', startHour: 12, endHour: 14, purpose: 'Analiză microstructură aliaje pentru lucrarea de licență.', status: 'PENDING' },
      { userId: maria.id, resourceId: sem.id, date: '2026-10-27', startHour: 9, endHour: 11, purpose: 'Caracterizare nanoparticule oxidice.', status: 'PENDING' },
      { userId: radu.id, resourceId: ftir.id, date: '2026-10-27', startHour: 13, endHour: 15, purpose: 'Identificare grupe funcționale polimeri.', status: 'PENDING' },
      { userId: ioana.id, resourceId: daq.id, date: '2026-10-28', startHour: 8, endHour: 10, purpose: 'Achiziție semnale senzori piezoelectrici.', status: 'PENDING' },
      { userId: vlad.id, resourceId: cluster.id, date: '2026-10-29', startHour: 10, endHour: 14, purpose: 'Antrenare rețea convoluțională pe set date medicale.', status: 'PENDING' },
      { userId: anamaria.id, resourceId: ftir.id, date: '2026-10-30', startHour: 11, endHour: 13, purpose: 'Analiză spectrofotometrică probe sol.', status: 'PENDING' },
    ],
  });

  console.log('Seeded Campus Cercetare database successfully.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

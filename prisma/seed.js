const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        console.log('📝 Creating Master Fasilitas...');
        const fasilitas = await Promise.all([
            // Fasilitas Umum
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'WiFi',
                    kategori: 'UMUM',
                    icon: 'wifi'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'CCTV',
                    kategori: 'UMUM',
                    icon: 'camera'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Dapur Bersama',
                    kategori: 'UMUM',
                    icon: 'chef'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Ruang Tamu',
                    kategori: 'UMUM',
                    icon: 'sofa'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Laundry',
                    kategori: 'UMUM',
                    icon: 'washing-machine'
                }
            }),

            // Fasilitas Parkir
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Parkir Motor',
                    kategori: 'PARKIR',
                    icon: 'motorcycle'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Parkir Mobil',
                    kategori: 'PARKIR',
                    icon: 'car'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Parkir Sepeda',
                    kategori: 'PARKIR',
                    icon: 'bicycle'
                }
            }),

            // Fasilitas Kamar
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'AC',
                    kategori: 'KAMAR',
                    icon: 'snowflake'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Kasur',
                    kategori: 'KAMAR',
                    icon: 'bed'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Lemari',
                    kategori: 'KAMAR',
                    icon: 'cabinet'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Meja Belajar',
                    kategori: 'KAMAR',
                    icon: 'desk'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Kursi',
                    kategori: 'KAMAR',
                    icon: 'chair'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'TV',
                    kategori: 'KAMAR',
                    icon: 'tv'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Kipas Angin',
                    kategori: 'KAMAR',
                    icon: 'fan'
                }
            }),

            // Fasilitas Kamar Mandi
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Kamar Mandi Dalam',
                    kategori: 'KAMAR_MANDI',
                    icon: 'bathroom'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Water Heater',
                    kategori: 'KAMAR_MANDI',
                    icon: 'water-heater'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Shower',
                    kategori: 'KAMAR_MANDI',
                    icon: 'shower'
                }
            }),
            prisma.masterFasilitas.create({
                data: {
                    nama_fasilitas: 'Toilet Duduk',
                    kategori: 'KAMAR_MANDI',
                    icon: 'toilet'
                }
            })
        ]);
        console.log(`✅ Created ${fasilitas.length} fasilitas`);

        console.log('📝 Creating Master Tipe Kamar...');
        const tipeKamar = await Promise.all([
            prisma.masterTipeKamar.create({
                data: {
                    nama_tipe: 'Single',
                    ukuran: '3x4 meter',
                    kapasitas: 1,
                    deskripsi: 'Kamar untuk 1 orang dengan fasilitas standar'
                }
            }),
            prisma.masterTipeKamar.create({
                data: {
                    nama_tipe: 'Double',
                    ukuran: '4x5 meter',
                    kapasitas: 2,
                    deskripsi: 'Kamar untuk 2 orang dengan 2 kasur single'
                }
            }),
            prisma.masterTipeKamar.create({
                data: {
                    nama_tipe: 'VIP Single',
                    ukuran: '4x5 meter',
                    kapasitas: 1,
                    deskripsi: 'Kamar VIP untuk 1 orang dengan fasilitas lengkap'
                }
            }),
            prisma.masterTipeKamar.create({
                data: {
                    nama_tipe: 'VIP Double',
                    ukuran: '5x6 meter',
                    kapasitas: 2,
                    deskripsi: 'Kamar VIP untuk 2 orang dengan fasilitas premium'
                }
            }),
            prisma.masterTipeKamar.create({
                data: {
                    nama_tipe: 'Family',
                    ukuran: '6x7 meter',
                    kapasitas: 4,
                    deskripsi: 'Kamar keluarga untuk maksimal 4 orang'
                }
            })
        ]);
        console.log(`✅ Created ${tipeKamar.length} tipe kamar`);

        console.log('📝 Creating Master Peraturan...');
        const peraturan = await Promise.all([
            // Peraturan Kost Umum
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Tidak boleh membawa tamu menginap',
                    kategori: 'KOST_UMUM',
                    icon: 'user-x'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Jam malam 22:00 WIB',
                    kategori: 'KOST_UMUM',
                    icon: 'clock'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Dilarang merokok di dalam kamar',
                    kategori: 'KOST_UMUM',
                    icon: 'no-smoking'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Wajib menjaga kebersihan',
                    kategori: 'KOST_UMUM',
                    icon: 'broom'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Dilarang membawa hewan peliharaan',
                    kategori: 'KOST_UMUM',
                    icon: 'pet-off'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Wajib lapor jika keluar lebih dari 3 hari',
                    kategori: 'KOST_UMUM',
                    icon: 'calendar'
                }
            }),

            // Peraturan Tipe Kamar
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Tidak boleh memasak di kamar',
                    kategori: 'TIPE_KAMAR',
                    icon: 'chef-off'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Wajib mematikan listrik saat keluar',
                    kategori: 'TIPE_KAMAR',
                    icon: 'power-off'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Maksimal 2 orang per kamar single',
                    kategori: 'TIPE_KAMAR',
                    icon: 'users'
                }
            }),
            prisma.masterPeraturan.create({
                data: {
                    nama_peraturan: 'Dilarang menggunakan alat elektronik berlebihan',
                    kategori: 'TIPE_KAMAR',
                    icon: 'zap-off'
                }
            })
        ]);
        console.log(`✅ Created ${peraturan.length} peraturan`);

        // 4. Create Master Layanan Laundry
        console.log('📝 Creating Master Layanan Laundry...');
        const layananLaundry = await Promise.all([
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Cuci Kering',
                    satuan: 'kg'
                }
            }),
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Cuci Setrika',
                    satuan: 'kg'
                }
            }),
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Setrika Saja',
                    satuan: 'pcs'
                }
            }),
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Dry Clean',
                    satuan: 'pcs'
                }
            }),
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Cuci Sepatu',
                    satuan: 'pcs'
                }
            }),
            prisma.masterLayananLaundry.create({
                data: {
                    nama_layanan: 'Cuci Selimut',
                    satuan: 'pcs'
                }
            })
        ]);
        console.log(`✅ Created ${layananLaundry.length} layanan laundry`);

        console.log('📝 Creating Users...');

        // Admin User
        const adminUser = await prisma.users.create({
            data: {
                email: 'admin@kosan.com',
                username: 'admin',
                password: await bcrypt.hash('Admin123!', 12),
                full_name: 'System Administrator',
                role: 'ADMIN',
                phone: '081234567890',
                whatsapp_number: '081234567890',
                is_approved: true,
                email_verified: true
            }
        });

        // Pengelola Users
        const pengelola1 = await prisma.users.create({
            data: {
                email: 'pengelola1@gmail.com',
                username: 'pengelola1',
                password: await bcrypt.hash('Pengelola123!', 12),
                full_name: 'Budi Santoso',
                role: 'PENGELOLA',
                phone: '081234567891',
                whatsapp_number: '081234567891',
                is_approved: true,
                email_verified: true
            }
        });

        const pengelola2 = await prisma.users.create({
            data: {
                email: 'pengelola2@gmail.com',
                username: 'pengelola2',
                password: await bcrypt.hash('Pengelola123!', 12),
                full_name: 'Siti Rahayu',
                role: 'PENGELOLA',
                phone: '081234567892',
                whatsapp_number: '081234567892',
                is_approved: true,
                email_verified: true
            }
        });

        // Penghuni Users
        const penghuni1 = await prisma.users.create({
            data: {
                email: 'penghuni1@gmail.com',
                username: 'penghuni1',
                password: await bcrypt.hash('Penghuni123!', 12),
                full_name: 'Ahmad Fauzi',
                role: 'PENGHUNI',
                phone: '081234567893',
                whatsapp_number: '081234567893',
                is_approved: true,
                email_verified: true
            }
        });

        const penghuni2 = await prisma.users.create({
            data: {
                email: 'penghuni2@gmail.com',
                username: 'penghuni2',
                password: await bcrypt.hash('Penghuni123!', 12),
                full_name: 'Maya Sari',
                role: 'PENGHUNI',
                phone: '081234567894',
                whatsapp_number: '081234567894',
                is_approved: true,
                email_verified: true
            }
        });

        const penghuni3 = await prisma.users.create({
            data: {
                email: 'penghuni3@gmail.com',
                username: 'penghuni3',
                password: await bcrypt.hash('Penghuni123!', 12),
                full_name: 'Rizki Pratama',
                role: 'PENGHUNI',
                phone: '081234567895',
                whatsapp_number: '081234567895',
                is_approved: true,
                email_verified: true
            }
        });

        console.log('✅ Created 6 users (1 admin, 2 pengelola, 3 penghuni)');

        console.log('📝 Creating Kost...');
        const kost1 = await prisma.kost.create({
            data: {
                pengelola_id: pengelola1.user_id,
                nama_kost: 'Kost Merdeka Raya',
                alamat: 'Jl. Merdeka Raya No. 123, Menteng, Jakarta Pusat, DKI Jakarta 10310',
                gmaps_link: 'https://goo.gl/maps/example1',
                deskripsi: 'Kost nyaman dan strategis di pusat kota Jakarta. Dekat dengan kampus UI, UNJ, dan berbagai perkantoran. Dilengkapi dengan fasilitas lengkap dan keamanan 24 jam.',
                total_kamar: 20,
                daya_listrik: '1300 VA',
                sumber_air: 'PDAM',
                wifi_speed: 'Indihome 50 Mbps',
                kapasitas_parkir_motor: 15,
                kapasitas_parkir_mobil: 5,
                kapasitas_parkir_sepeda: 10,
                biaya_tambahan: 50000,
                jam_survey: '08:00 - 21:00 WIB',
                foto_kost: [
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
                ],
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'BCA',
                    nomor: '1234567890',
                    atas_nama: 'Budi Santoso'
                },
                is_approved: true
            }
        });

        const kost2 = await prisma.kost.create({
            data: {
                pengelola_id: pengelola2.user_id,
                nama_kost: 'Kost Sudirman Residence',
                alamat: 'Jl. Sudirman No. 456, Setiabudi, Jakarta Selatan, DKI Jakarta 12920',
                gmaps_link: 'https://goo.gl/maps/example2',
                deskripsi: 'Kost eksklusif dengan pemandangan kota Jakarta. Dekat dengan area bisnis Sudirman dan SCBD. Fasilitas premium dengan pelayanan seperti hotel.',
                total_kamar: 30,
                daya_listrik: '2200 VA',
                sumber_air: 'PDAM + Filter',
                wifi_speed: 'Fiber Optic 100 Mbps',
                kapasitas_parkir_motor: 25,
                kapasitas_parkir_mobil: 10,
                kapasitas_parkir_sepeda: 15,
                biaya_tambahan: 75000,
                jam_survey: '07:00 - 22:00 WIB',
                foto_kost: [
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800'
                ],
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'Mandiri',
                    nomor: '0987654321',
                    atas_nama: 'Siti Rahayu'
                },
                is_approved: true
            }
        });

        console.log('✅ Created 2 kost');

        console.log('📝 Adding Fasilitas to Kost...');

        // Kost 1 Fasilitas
        await Promise.all([
            prisma.kostFasilitas.create({
                data: { kost_id: kost1.kost_id, fasilitas_id: fasilitas[0].fasilitas_id } // WiFi
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost1.kost_id, fasilitas_id: fasilitas[1].fasilitas_id } // CCTV
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost1.kost_id, fasilitas_id: fasilitas[2].fasilitas_id } // Dapur
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost1.kost_id, fasilitas_id: fasilitas[4].fasilitas_id } // Laundry
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost1.kost_id, fasilitas_id: fasilitas[5].fasilitas_id } // Parkir Motor
            })
        ]);

        // Kost 2 Fasilitas
        await Promise.all([
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[0].fasilitas_id } // WiFi
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[1].fasilitas_id } // CCTV
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[2].fasilitas_id } // Dapur
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[3].fasilitas_id } // Ruang Tamu
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[4].fasilitas_id } // Laundry
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[5].fasilitas_id } // Parkir Motor
            }),
            prisma.kostFasilitas.create({
                data: { kost_id: kost2.kost_id, fasilitas_id: fasilitas[6].fasilitas_id } // Parkir Mobil
            })
        ]);

        console.log('✅ Added fasilitas to kost');

        console.log('📝 Adding Peraturan to Kost...');

        // Kost 1 Peraturan
        await Promise.all([
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost1.kost_id,
                    peraturan_id: peraturan[0].peraturan_id,
                    keterangan_tambahan: 'Tamu hanya boleh berkunjung sampai jam 20:00 WIB'
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost1.kost_id,
                    peraturan_id: peraturan[1].peraturan_id,
                    keterangan_tambahan: 'Pintu utama ditutup jam 22:00 WIB'
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost1.kost_id,
                    peraturan_id: peraturan[2].peraturan_id
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost1.kost_id,
                    peraturan_id: peraturan[3].peraturan_id,
                    keterangan_tambahan: 'Jadwal kebersihan kamar mandi setiap hari Sabtu'
                }
            })
        ]);

        // Kost 2 Peraturan
        await Promise.all([
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost2.kost_id,
                    peraturan_id: peraturan[0].peraturan_id,
                    keterangan_tambahan: 'Tamu menginap dikenakan biaya Rp 50.000/malam'
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost2.kost_id,
                    peraturan_id: peraturan[1].peraturan_id,
                    keterangan_tambahan: 'Akses kartu berlaku 24 jam untuk penghuni VIP'
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost2.kost_id,
                    peraturan_id: peraturan[2].peraturan_id
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost2.kost_id,
                    peraturan_id: peraturan[4].peraturan_id
                }
            }),
            prisma.kostPeraturan.create({
                data: {
                    kost_id: kost2.kost_id,
                    peraturan_id: peraturan[5].peraturan_id
                }
            })
        ]);

        console.log('✅ Added peraturan to kost');

        console.log('📝 Creating Kamar...');
        const kamarList = [];

        // Kost 1 - Kamar (20 kamar)
        const kost1Kamar = [];
        for (let i = 1; i <= 20; i++) {
            const floor = Math.ceil(i / 10);
            const roomNumber = i.toString().padStart(2, '0');
            const nomorKamar = `${floor}${roomNumber}`;

            let tipeIndex, harga, deposit;
            if (i <= 10) {
                tipeIndex = 0; // Single
                harga = 1500000;
                deposit = 1500000;
            } else if (i <= 15) {
                tipeIndex = 1; // Double
                harga = 2000000;
                deposit = 2000000;
            } else {
                tipeIndex = 2; // VIP Single
                harga = 2500000;
                deposit = 2500000;
            }

            const kamar = await prisma.kamar.create({
                data: {
                    kost_id: kost1.kost_id,
                    tipe_id: tipeKamar[tipeIndex].tipe_id,
                    nomor_kamar: nomorKamar,
                    harga_bulanan: harga,
                    deposit: deposit,
                    foto_kamar: [
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
                        'https://images.unsplash.com/photo-1560448075-bb485b067938?w=600'
                    ],
                    status: i <= 3 ? 'TERISI' : (i === 4 ? 'MAINTENANCE' : 'TERSEDIA')
                }
            });
            kost1Kamar.push(kamar);
        }

        // Kost 2 - Kamar (30 kamar)
        const kost2Kamar = [];
        for (let i = 1; i <= 30; i++) {
            const floor = Math.ceil(i / 10);
            const roomNumber = (i % 10 === 0 ? 10 : i % 10).toString().padStart(2, '0');
            const nomorKamar = `${floor}${roomNumber}`;

            let tipeIndex, harga, deposit;
            if (i <= 10) {
                tipeIndex = 0; // Single
                harga = 2000000;
                deposit = 2000000;
            } else if (i <= 20) {
                tipeIndex = 2; // VIP Single
                harga = 3000000;
                deposit = 3000000;
            } else if (i <= 25) {
                tipeIndex = 3; // VIP Double
                harga = 4000000;
                deposit = 4000000;
            } else {
                tipeIndex = 4; // Family
                harga = 5000000;
                deposit = 5000000;
            }

            const kamar = await prisma.kamar.create({
                data: {
                    kost_id: kost2.kost_id,
                    tipe_id: tipeKamar[tipeIndex].tipe_id,
                    nomor_kamar: nomorKamar,
                    harga_bulanan: harga,
                    deposit: deposit,
                    foto_kamar: [
                        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
                        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'
                    ],
                    status: i <= 5 ? 'TERISI' : (i === 6 ? 'MAINTENANCE' : 'TERSEDIA')
                }
            });
            kost2Kamar.push(kamar);
        }

        kamarList.push(...kost1Kamar, ...kost2Kamar);
        console.log(`✅ Created ${kamarList.length} kamar (20 for kost1, 30 for kost2)`);

        console.log('📝 Adding Fasilitas to Kamar...');

        // Add basic facilities to all rooms
        const basicFacilities = [9, 10, 11]; // Kasur, Lemari, Meja Belajar
        const acFacility = 8; // AC
        const tvFacility = 13; // TV
        const kipasAnginFacility = 14; // Kipas Angin
        const kamarMandiFacility = 15; // Kamar Mandi Dalam
        const waterHeaterFacility = 16; // Water Heater

        for (const kamar of kamarList) {
            // Basic facilities for all rooms
            for (const facilityIndex of basicFacilities) {
                await prisma.kamarFasilitas.create({
                    data: {
                        kamar_id: kamar.kamar_id,
                        fasilitas_id: fasilitas[facilityIndex].fasilitas_id
                    }
                });
            }

            // Kamar Mandi Dalam for all rooms
            await prisma.kamarFasilitas.create({
                data: {
                    kamar_id: kamar.kamar_id,
                    fasilitas_id: fasilitas[kamarMandiFacility].fasilitas_id
                }
            });

            // VIP rooms get AC and TV
            const kamarNumber = parseInt(kamar.nomor_kamar.slice(-2));
            const isVipRoom = (kamar.kost_id === kost1.kost_id && kamarNumber > 15) ||
                (kamar.kost_id === kost2.kost_id && kamarNumber > 10);

            if (isVipRoom) {
                await prisma.kamarFasilitas.create({
                    data: {
                        kamar_id: kamar.kamar_id,
                        fasilitas_id: fasilitas[acFacility].fasilitas_id
                    }
                });
                await prisma.kamarFasilitas.create({
                    data: {
                        kamar_id: kamar.kamar_id,
                        fasilitas_id: fasilitas[tvFacility].fasilitas_id
                    }
                });
                await prisma.kamarFasilitas.create({
                    data: {
                        kamar_id: kamar.kamar_id,
                        fasilitas_id: fasilitas[waterHeaterFacility].fasilitas_id
                    }
                });
            } else {
                // Regular rooms get Kipas Angin
                await prisma.kamarFasilitas.create({
                    data: {
                        kamar_id: kamar.kamar_id,
                        fasilitas_id: fasilitas[kipasAnginFacility].fasilitas_id
                    }
                });
            }
        }

        console.log('✅ Added fasilitas to all kamar');

        console.log('📝 Creating Reservasi and Penghuni...');

        // Create reservations for occupied rooms
        const occupiedRooms = kamarList.filter(k => k.status === 'TERISI');
        const penghuni = [penghuni1, penghuni2, penghuni3];

        for (let i = 0; i < Math.min(occupiedRooms.length, penghuni.length); i++) {
            const room = occupiedRooms[i];
            const user = penghuni[i];

            const checkInDate = new Date();
            checkInDate.setMonth(checkInDate.getMonth() - Math.floor(Math.random() * 6)); // 0-6 months ago

            const reservasi = await prisma.reservasi.create({
                data: {
                    user_id: user.user_id,
                    kamar_id: room.kamar_id,
                    tanggal_check_in: checkInDate,
                    durasi_bulan: 12,
                    total_harga: room.harga_bulanan * 12,
                    bukti_bayar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
                    status: 'APPROVED',
                    metode_bayar: 'TRANSFER',
                    validated_by: adminUser.user_id,
                    validated_at: checkInDate
                }
            });

            // Create penghuni record
            await prisma.penghuni.create({
                data: {
                    reservasi_id: reservasi.reservasi_id,
                    tanggal_masuk: checkInDate,
                    deposit: room.deposit,
                    status: 'AKTIF'
                }
            });
        }

        console.log(`✅ Created ${Math.min(occupiedRooms.length, penghuni.length)} reservasi and penghuni`);

        console.log('📝 Creating Catering...');

        const catering1 = await prisma.catering.create({
            data: {
                kost_id: kost1.kost_id,
                nama_catering: 'Warung Bu Tini',
                alamat: 'Jl. Merdeka Raya No. 125, Jakarta Pusat',
                whatsapp_number: '081234567896',
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'BRI',
                    nomor: '1111222233334444',
                    atas_nama: 'Tini Suhartini'
                },
                is_partner: true,
                is_active: true
            }
        });

        const catering2 = await prisma.catering.create({
            data: {
                kost_id: kost2.kost_id,
                nama_catering: 'Dapur Sehat Mama',
                alamat: 'Jl. Sudirman No. 458, Jakarta Selatan',
                whatsapp_number: '081234567897',
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'BCA',
                    nomor: '5555666677778888',
                    atas_nama: 'Sari Dewi'
                },
                is_partner: false,
                is_active: true
            }
        });

        console.log('✅ Created 2 catering');

        console.log('📝 Creating Catering Menu...');

        const cateringMenus = [];

        // Catering 1 Menu
        const catering1Menus = await Promise.all([
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering1.catering_id,
                    nama_menu: 'Nasi Gudeg Jogja',
                    kategori: 'MAKANAN_BERAT',
                    harga: 15000,
                    foto_menu: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering1.catering_id,
                    nama_menu: 'Nasi Ayam Bakar',
                    kategori: 'MAKANAN_BERAT',
                    harga: 18000,
                    foto_menu: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering1.catering_id,
                    nama_menu: 'Gado-gado',
                    kategori: 'MAKANAN_BERAT',
                    harga: 12000,
                    foto_menu: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering1.catering_id,
                    nama_menu: 'Es Teh Manis',
                    kategori: 'MINUMAN',
                    harga: 5000,
                    foto_menu: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering1.catering_id,
                    nama_menu: 'Kerupuk',
                    kategori: 'SNACK',
                    harga: 3000,
                    foto_menu: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400',
                    is_available: true
                }
            })
        ]);

        // Catering 2 Menu
        const catering2Menus = await Promise.all([
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering2.catering_id,
                    nama_menu: 'Salmon Teriyaki Bowl',
                    kategori: 'MAKANAN_BERAT',
                    harga: 35000,
                    foto_menu: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering2.catering_id,
                    nama_menu: 'Chicken Caesar Salad',
                    kategori: 'MAKANAN_BERAT',
                    harga: 28000,
                    foto_menu: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering2.catering_id,
                    nama_menu: 'Smoothie Bowl',
                    kategori: 'SNACK',
                    harga: 22000,
                    foto_menu: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering2.catering_id,
                    nama_menu: 'Fresh Orange Juice',
                    kategori: 'MINUMAN',
                    harga: 15000,
                    foto_menu: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400',
                    is_available: true
                }
            }),
            prisma.cateringMenu.create({
                data: {
                    catering_id: catering2.catering_id,
                    nama_menu: 'Green Tea Latte',
                    kategori: 'MINUMAN',
                    harga: 18000,
                    foto_menu: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
                    is_available: true
                }
            })
        ]);

        cateringMenus.push(...catering1Menus, ...catering2Menus);
        console.log(`✅ Created ${cateringMenus.length} catering menu items`);

        console.log('📝 Creating Sample Pesanan Catering...');

        const pesananCatering = await Promise.all([
            prisma.pesananCatering.create({
                data: {
                    user_id: penghuni1.user_id,
                    menu_id: catering1Menus[0].menu_id,
                    jumlah_porsi: 2,
                    total_harga: catering1Menus[0].harga * 2,
                    status: 'COMPLETED',
                    catatan: 'Pedas sedang'
                }
            }),
            prisma.pesananCatering.create({
                data: {
                    user_id: penghuni2.user_id,
                    menu_id: catering2Menus[0].menu_id,
                    jumlah_porsi: 1,
                    total_harga: catering2Menus[0].harga,
                    status: 'CONFIRMED',
                    catatan: 'Tanpa mayonnaise'
                }
            })
        ]);

        // Create Pembayaran for Catering
        for (const pesanan of pesananCatering) {
            await prisma.pembayaranCatering.create({
                data: {
                    pesanan_id: pesanan.pesanan_id,
                    jumlah: pesanan.total_harga,
                    metode: 'QRIS',
                    bukti_bayar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
                    status: 'VERIFIED',
                    verified_by: adminUser.user_id,
                    verified_at: new Date()
                }
            });
        }

        console.log(`✅ Created ${pesananCatering.length} pesanan catering with payments`);

        console.log('📝 Creating Laundry...');

        const laundry1 = await prisma.laundry.create({
            data: {
                kost_id: kost1.kost_id,
                nama_laundry: 'Laundry Express 24 Jam',
                alamat: 'Jl. Merdeka Raya No. 127, Jakarta Pusat',
                whatsapp_number: '081234567898',
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'Mandiri',
                    nomor: '9999888877776666',
                    atas_nama: 'Laundry Express'
                },
                is_partner: true,
                is_active: true
            }
        });

        const laundry2 = await prisma.laundry.create({
            data: {
                kost_id: kost2.kost_id,
                nama_laundry: 'Premium Clean Laundry',
                alamat: 'Jl. Sudirman No. 460, Jakarta Selatan',
                whatsapp_number: '081234567899',
                qris_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
                rekening_info: {
                    bank: 'BCA',
                    nomor: '3333444455556666',
                    atas_nama: 'Premium Clean'
                },
                is_partner: false,
                is_active: true
            }
        });

        console.log('✅ Created 2 laundry services');

        console.log('📝 Creating Laundry Harga...');

        // Laundry 1 - Regular prices
        const laundry1Harga = await Promise.all([
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry1.laundry_id,
                    layanan_id: layananLaundry[0].layanan_id, // Cuci Kering
                    harga_per_satuan: 8000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry1.laundry_id,
                    layanan_id: layananLaundry[1].layanan_id, // Cuci Setrika
                    harga_per_satuan: 12000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry1.laundry_id,
                    layanan_id: layananLaundry[2].layanan_id, // Setrika Saja
                    harga_per_satuan: 5000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry1.laundry_id,
                    layanan_id: layananLaundry[4].layanan_id, // Cuci Sepatu
                    harga_per_satuan: 15000,
                    is_available: true
                }
            })
        ]);

        // Laundry 2 - Premium prices
        const laundry2Harga = await Promise.all([
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry2.laundry_id,
                    layanan_id: layananLaundry[0].layanan_id, // Cuci Kering
                    harga_per_satuan: 12000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry2.laundry_id,
                    layanan_id: layananLaundry[1].layanan_id, // Cuci Setrika
                    harga_per_satuan: 18000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry2.laundry_id,
                    layanan_id: layananLaundry[3].layanan_id, // Dry Clean
                    harga_per_satuan: 35000,
                    is_available: true
                }
            }),
            prisma.laundryHarga.create({
                data: {
                    laundry_id: laundry2.laundry_id,
                    layanan_id: layananLaundry[5].layanan_id, // Cuci Selimut
                    harga_per_satuan: 25000,
                    is_available: true
                }
            })
        ]);

        console.log(`✅ Created ${laundry1Harga.length + laundry2Harga.length} laundry pricing`);

        console.log('📝 Creating Sample Pesanan Laundry...');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        const pesananLaundry = await Promise.all([
            prisma.pesananLaundry.create({
                data: {
                    user_id: penghuni1.user_id,
                    laundry_id: laundry1.laundry_id,
                    detail_layanan: [
                        {
                            layanan_id: layananLaundry[1].layanan_id,
                            nama_layanan: 'Cuci Setrika',
                            qty: 3,
                            harga: 12000,
                            subtotal: 36000
                        }
                    ],
                    total_estimasi: 36000,
                    total_final: 42000,
                    berat_actual: 3.5,
                    tanggal_antar: new Date(),
                    estimasi_selesai: tomorrow,
                    status: 'PROSES',
                    catatan: 'Jangan pakai pelembut'
                }
            }),
            prisma.pesananLaundry.create({
                data: {
                    user_id: penghuni2.user_id,
                    laundry_id: laundry2.laundry_id,
                    detail_layanan: [
                        {
                            layanan_id: layananLaundry[3].layanan_id,
                            nama_layanan: 'Dry Clean',
                            qty: 2,
                            harga: 35000,
                            subtotal: 70000
                        }
                    ],
                    total_estimasi: 70000,
                    total_final: 70000,
                    berat_actual: null,
                    tanggal_antar: new Date(),
                    estimasi_selesai: dayAfterTomorrow,
                    status: 'DITERIMA',
                    catatan: 'Jas kantor dan dress'
                }
            })
        ]);

        // Create Pembayaran for Laundry
        for (const pesanan of pesananLaundry) {
            await prisma.pembayaranLaundry.create({
                data: {
                    pesanan_id: pesanan.pesanan_id,
                    jumlah: pesanan.total_final || pesanan.total_estimasi,
                    metode: 'TRANSFER',
                    bukti_bayar: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
                    status: pesanan.status === 'PROSES' ? 'VERIFIED' : 'PENDING',
                    verified_by: pesanan.status === 'PROSES' ? adminUser.user_id : null,
                    verified_at: pesanan.status === 'PROSES' ? new Date() : null
                }
            });
        }

        console.log(`✅ Created ${pesananLaundry.length} pesanan laundry with payments`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   👥 Users: 6 (1 Admin, 2 Pengelola, 3 Penghuni)`);
        console.log(`   🏠 Kost: 2`);
        console.log(`   🚪 Kamar: 50 total`);
        console.log(`   📋 Master Fasilitas: ${fasilitas.length}`);
        console.log(`   📋 Master Tipe Kamar: ${tipeKamar.length}`);
        console.log(`   📋 Master Peraturan: ${peraturan.length}`);
        console.log(`   📋 Master Layanan Laundry: ${layananLaundry.length}`);
        console.log(`   🍽️  Catering: 2 with ${cateringMenus.length} menu items`);
        console.log(`   🧺 Laundry: 2 with pricing`);
        console.log(`   📝 Reservasi: ${Math.min(occupiedRooms.length, penghuni.length)}`);
        console.log(`   🍕 Pesanan Catering: ${pesananCatering.length}`);
        console.log(`   👔 Pesanan Laundry: ${pesananLaundry.length}`);

        console.log('\n🔑 Default Login Credentials:');
        console.log('   Admin: admin@kosan.com / Admin123!');
        console.log('   Pengelola 1: pengelola1@gmail.com / Pengelola123!');
        console.log('   Pengelola 2: pengelola2@gmail.com / Pengelola123!');
        console.log('   Penghuni 1: penghuni1@gmail.com / Penghuni123!');
        console.log('   Penghuni 2: penghuni2@gmail.com / Penghuni123!');
        console.log('   Penghuni 3: penghuni3@gmail.com / Penghuni123!');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed');
    });
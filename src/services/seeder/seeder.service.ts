import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../../category/entities/category.entity';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import {
  // AGENTS,
  // CATEGORIES,
  // LOCATIONS,
  // SUBCATEGORIES,
  // USERS,
  // DEPARTMENTS,
  REGIONS,
  SECTORS,
} from '../../data/seed.data';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Region } from '../../location/entities/regiion.entity';
import { Sector } from './sector.entity';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Department } from 'src/common/entities/Department';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Computer } from 'src/computer/entities/computer.entity';
import { PcModel } from 'src/pc-model/entities/pc-model.entity';
import { ComputerMaintenance } from 'src/computer/entities/computer-maintenance.entity';
import { ComputerAssignmentHistory } from 'src/computer/entities/assignment-history.entity';

@Injectable()
export class SeederService {
  @InjectRepository(Category)
  private readonly categoriesRepository: Repository<Category>;

  @InjectRepository(Subcategory)
  private readonly subcategoriesRepository: Repository<Subcategory>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @InjectRepository(Location)
  private readonly locationRepository: Repository<Location>;

  @InjectRepository(Region)
  private readonly regionRepository: Repository<Region>;

  @InjectRepository(Sector)
  private readonly sectorRepository: Repository<Sector>;

  @InjectRepository(Agent)
  private readonly agentRepository: Repository<Agent>;

  @InjectRepository(Department)
  private readonly departmentRepository: Repository<Department>;

  @InjectRepository(Ticket)
  private readonly ticketRepository: Repository<Ticket>;

  @InjectRepository(Computer)
  private readonly computerRepository: Repository<Computer>;

  @InjectRepository(PcModel)
  private readonly pcModelRepository: Repository<PcModel>;

  @InjectRepository(ComputerMaintenance)
  private readonly maintenanceRepository: Repository<ComputerMaintenance>;

  @InjectRepository(ComputerAssignmentHistory)
  private readonly assignmentHistoryRepository: Repository<ComputerAssignmentHistory>;

  async seed() {
    await this.seedComputers();
    // await this.seedTickets();
    // await this.departments();
    // await this.categories();
    // await this.subcategories();
    // await this.users();
    // await this.locations();
    // await this.agents();
    // await this.sectors();
  }

  // async categories() {
  //   const data = await this.categoriesRepository.find();

  //   if (data.length <= 0) {
  //     await this.categoriesRepository.save(CATEGORIES);
  //   }
  // }

  // async subcategories() {
  //   const data = await this.subcategoriesRepository.find();

  //   if (data.length <= 0) {
  //     await this.subcategoriesRepository.save(SUBCATEGORIES);
  //   }
  // }

  // async users() {
  //   const data = await this.userRepository.find();

  //   if (data.length <= 0) {
  //     await this.userRepository.save(USERS);
  //   }
  // }

  async region() {
    const data = await this.regionRepository.find();
    // console.log('SEEDING CALLED');
    if (data.length <= 0) {
      await this.regionRepository.save(REGIONS);
    }
  }

  // async locations() {
  //   const data = await this.locationRepository.find();

  //   if (data.length <= 0) {
  //     await this.locationRepository.save(LOCATIONS);
  //   }
  // }

  async sectors() {
    const data = await this.sectorRepository.find();

    if (data.length <= 0) {
      await this.sectorRepository.save(SECTORS);
    }
  }

  // async agents() {
  //   const data = await this.agentRepository.find();

  //   if (data.length <= 0) {
  //     await this.agentRepository.save(AGENTS);
  //   }
  // }

  // async departments() {
  //   const data = await this.departmentRepository.find();

  //   if (data.length <= 0) {
  //     await this.departmentRepository.save(DEPARTMENTS);
  //   }
  // }

  async seedTickets() {
    try {
      await this.ticketRepository.delete({});
      await this.agentRepository.delete({});
      await this.subcategoriesRepository.delete({});
      await this.categoriesRepository.delete({});
      await this.locationRepository.delete({});
      await this.userRepository.delete({});

      // Seed Locations
      const locations = [
        { id: faker.string.uuid(), name: 'Abuja' },
        { id: faker.string.uuid(), name: 'Lagos' },
      ];
      await this.locationRepository.save(locations);

      // Seed Users
      const users = Array.from({ length: 20 }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      }));
      await this.userRepository.save(users);

      // Seed Categories
      const categories = [
        { id: faker.string.uuid(), name: 'Network' },
        { id: faker.string.uuid(), name: 'Hardware' },
        { id: faker.string.uuid(), name: 'Softwares' },
        { id: faker.string.uuid(), name: 'Business Applications' },
      ];
      await this.categoriesRepository.save(categories);

      // Seed Subcategories
      const subcategories = [
        {
          id: faker.string.uuid(),
          name: 'Connectivity Issues',
          categoryId: categories[0].id,
          slaHours: 4,
        },
        {
          id: faker.string.uuid(),
          name: 'Server Failure',
          categoryId: categories[1].id,
          slaHours: 6,
        },
        {
          id: faker.string.uuid(),
          name: 'Software Bug',
          categoryId: categories[2].id,
          slaHours: 8,
        },
        {
          id: faker.string.uuid(),
          name: 'CRM Issues',
          categoryId: categories[3].id,
          slaHours: 5,
        },
      ];
      await this.subcategoriesRepository.save(subcategories);

      // Seed Agents
      const agents = Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        isActive: faker.datatype.boolean(0.8),
        agentType: 'agent',
        locationId: faker.helpers.arrayElement(locations).id,
        tierLevel: faker.number.int({ min: 1, max: 3 }),
        totalRatings: faker.number.int({ min: 0, max: 50 }),
        averageRating: faker.number.float({
          min: 1,
          max: 5,
          fractionDigits: 1,
        }),
        ticket_count: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await this.agentRepository.save(agents);

      // Seed Tickets (500 tickets distributed across 6 months)
      const tickets = [];
      const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      const ticketCounts = [50, 60, 70, 80, 90, 150]; // More tickets in recent months
      //const currentYear = 2025;

      for (let i = 0; i < months.length; i++) {
        //const monthIndex = 2 + i; // March (2) to August (7)
        const monthTickets = ticketCounts[i];

        for (let j = 0; j < monthTickets; j++) {
          const now = new Date();
          const createdAt = faker.date.past({ years: 1, refDate: now });

          // const createdAt = faker.date.between({
          //   from: new Date(currentYear, monthIndex, 1),
          //   to: new Date(currentYear, monthIndex + 1, 0, 23, 59, 59),
          // });

          const status = faker.helpers.arrayElement([
            'in_progress',
            'resolved',
            'pending',
          ]);
          let resolvedAt: Date | null = null;
          let resolutionDuration: number | null = null;
          let resolutionStartTime: Date | null = null;

          if (status === 'resolved') {
            resolutionStartTime = new Date(
              createdAt.getTime() +
                faker.number.int({ min: 60000, max: 3600000 }),
            ); // 1 min to 1 hr after creation
            resolvedAt = new Date(
              resolutionStartTime.getTime() +
                faker.number.int({ min: 3600000, max: 10800000 }),
            ); // 1-3 hours later
            resolutionDuration =
              resolvedAt.getTime() - resolutionStartTime.getTime(); // In milliseconds
          }

          const category = faker.helpers.arrayElement(categories);

          const subcategory = faker.helpers.arrayElement(
            subcategories.filter((sc) => sc.categoryId === category.id),
          );

          const ticket: Partial<Ticket> = {
            id: faker.string.uuid(),
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            description: faker.lorem.paragraph(),
            ticketRef: `TICKET-${faker.number.int({ min: 1000, max: 9999 })}`,
            locationId: faker.helpers.arrayElement(locations).id,
            categoryId: faker.helpers.arrayElement(categories).id,
            subcategoryId: subcategory?.id,
            userId: faker.helpers.arrayElement(users).id,
            assignedAt: faker.date.between({ from: createdAt, to: new Date() }),
            escalationTier: faker.number.int({ min: 1, max: 3 }),
            resolutionStartTime,
            currentDesk: 'agent',
            resolutionEndTime: resolvedAt,
            resolutionDuration,
            agentId: faker.helpers.arrayElement(agents).id,
            resolution: status === 'resolved' ? faker.lorem.sentence() : null,
            status,
            createdAt,
            updatedAt: createdAt,
            resolvedAt,
            sla_deadline: faker.date.soon({ days: 2, refDate: createdAt }),
            sla_breached: faker.datatype.boolean(0.1), // 10% chance of SLA breach
            is_escalated: faker.datatype.boolean(0.2), // 20% chance of escalation
            escalation_time: faker.datatype.boolean(0.2)
              ? faker.date.soon({ days: 1, refDate: createdAt })
              : null,
            admin_escalation_time: null,
            rating:
              status === 'resolved'
                ? faker.number.int({ min: 1, max: 5 })
                : null,
            feedback: status === 'resolved' ? faker.lorem.sentence() : null,
            ratedAt:
              status === 'resolved'
                ? faker.date.soon({ days: 1, refDate: resolvedAt })
                : null,
          };

          tickets.push(ticket);
        }
      }

      const batchSize = 20;
      for (let i = 0; i < tickets.length; i += batchSize) {
        const batch = tickets.slice(i, i + batchSize);
        await this.ticketRepository.save(batch);
      }

      // Update agent ticket counts
      for (const agent of agents) {
        const ticketCount = await this.ticketRepository.count({
          where: { agentId: agent.id },
        });
        agent.ticket_count = ticketCount;
      }
      await this.agentRepository.save(agents);

      return {
        message: `Successfully seeded ${tickets.length} tickets and related entities.`,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }

  async seedComputers() {
    try {
      await this.assignmentHistoryRepository.delete({});
      await this.maintenanceRepository.delete({});
      await this.computerRepository.delete({});
      await this.departmentRepository.delete({});
      await this.pcModelRepository.delete({});
      // await this.userRepository.delete({});

      // Seed Departments
      const departments = [
        {
          id: faker.string.uuid(),
          name: 'IT',
          description: 'Information Technology Department',
        },
        {
          id: faker.string.uuid(),
          name: 'HR',
          description: 'Human Resources Department',
        },
        {
          id: faker.string.uuid(),
          name: 'Finance',
          description: 'Finance and Accounting Department',
        },
        {
          id: faker.string.uuid(),
          name: 'Marketing',
          description: 'Marketing and Sales Department',
        },
        {
          id: faker.string.uuid(),
          name: 'Operations',
          description: 'Operations and Logistics Department',
        },
      ];
      await this.departmentRepository.save(departments);

      // Seed PC Models
      const pcModels = [
        { id: faker.string.uuid(), name: 'Dell XPS 13', manufacturer: 'Dell' },
        {
          id: faker.string.uuid(),
          name: 'HP EliteBook 840',
          manufacturer: 'HP',
        },
        {
          id: faker.string.uuid(),
          name: 'Lenovo ThinkPad X1',
          manufacturer: 'Lenovo',
        },
        {
          id: faker.string.uuid(),
          name: 'MacBook Pro 14',
          manufacturer: 'Apple',
        },
        {
          id: faker.string.uuid(),
          name: 'Surface Laptop 4',
          manufacturer: 'Microsoft',
        },
        {
          id: faker.string.uuid(),
          name: 'Acer Aspire 5',
          manufacturer: 'Acer',
        },
        {
          id: faker.string.uuid(),
          name: 'ASUS ZenBook 14',
          manufacturer: 'ASUS',
        },
        {
          id: faker.string.uuid(),
          name: 'Dell Latitude 7420',
          manufacturer: 'Dell',
        },
        { id: faker.string.uuid(), name: 'HP Pavilion 15', manufacturer: 'HP' },
        {
          id: faker.string.uuid(),
          name: 'Lenovo IdeaPad 3',
          manufacturer: 'Lenovo',
        },
      ];
      await this.pcModelRepository.save(pcModels);

      // Seed Users
      const users = Array.from({ length: 50 }, () => ({
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      }));
      await this.userRepository.save(users);

      // Seed Computers (120 computers)
      const computers = [];
      const operatingSystems = [
        'Windows 11',
        'Windows 10',
        'macOS Ventura',
        'Ubuntu 22.04',
      ];
      const applications = [
        'Microsoft Office',
        'Google Chrome',
        'Slack',
        'Zoom',
        'Adobe Acrobat',
        'VS Code',
      ];

      const maintenanceDescriptions = [
        'Replaced hard drive',
        'Updated OS',
        'Cleaned hardware',
        'Repaired screen',
        'Installed new RAM',
      ];

      for (let i = 0; i < 120; i++) {
        const user = faker.datatype.boolean(0.5)
          ? faker.helpers.arrayElement(users)
          : null; // 50% chance of user assignment

        const computer: Partial<Computer> = {
          id: faker.string.uuid(),
          name: `PC-${faker.number.int({ min: 1000, max: 9999 })}`,
          modelId: faker.helpers.arrayElement(pcModels).id,
          serialNumber: faker.string.alphanumeric(12).toUpperCase(), // Unique serial number
          operatingSystem: faker.helpers.arrayElement(operatingSystems),
          domainName: faker.datatype.boolean(0.8)
            ? `corp-${faker.internet.domainName()}`
            : null, // 80% have domain
          applications: faker.helpers.arrayElements(
            applications,
            faker.number.int({ min: 2, max: 5 }),
          ), // 2-5 apps
          departmentId: faker.helpers.arrayElement(departments).id,
          userId: user?.id || null,
          assignedDate: user
            ? faker.date.past({ years: 1, refDate: new Date(2025, 7, 24) })
            : null,
          createdAt: faker.date.past({
            years: 2,
            refDate: new Date(2025, 7, 24),
          }),
          updatedAt: faker.date.past({
            years: 1,
            refDate: new Date(2025, 7, 24),
          }),
          isActive: faker.datatype.boolean(0.9), // 90% active
          endOfLife: new Date(new Date(2025, 7, 24).setFullYear(2025 + 5)), // Set by @BeforeInsert
        };

        computers.push(computer);
      }

      // Save computers in batches to ensure reliability
      const batchSize = 20;
      for (let i = 0; i < computers.length; i += batchSize) {
        const batch = computers.slice(i, i + batchSize);
        await this.computerRepository.save(batch);
      }

      // Verify computer count
      const finalComputerCount = await this.computerRepository.count();

      // Seed Assignment History and Maintenance for each computer
      for (const computer of computers) {
        // Assignment History: 1-3 past assignments per computer
        const numAssignments = faker.number.int({ min: 1, max: 3 });
        let currentDate = new Date(computer.createdAt); // Start from computer creation
        const assignmentHistories = [];
        for (let j = 0; j < numAssignments; j++) {
          const user = faker.helpers.arrayElement(users);
          const assignedDate = currentDate;
          const unassignedDate = faker.date.between({
            from: assignedDate,
            to: new Date(2025, 7, 24),
          });
          const duration = Math.ceil(
            (unassignedDate.getTime() - assignedDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ); // Days
          const history: Partial<ComputerAssignmentHistory> = {
            computerId: computer.id,
            userId: user.id,
            assignedDate,
            unassignedDate,
            duration,
            createdAt: assignedDate,
            updatedAt: unassignedDate,
          };
          assignmentHistories.push(history);
          currentDate = unassignedDate; // Next assignment starts after previous ends
        }
        await this.assignmentHistoryRepository.save(assignmentHistories);
        // Maintenance Records: 0-2 per computer
        const numMaintenances = faker.number.int({ min: 0, max: 2 });
        const maintenances = [];
        for (let j = 0; j < numMaintenances; j++) {
          // Choose a random assignment to link the user at the time
          const assignment = faker.helpers.arrayElement(assignmentHistories);
          const maintenanceDate = faker.date.between({
            from: assignment.assignedDate,
            to: assignment.unassignedDate || new Date(2025, 7, 24),
          });
          const cost = faker.number.float({
            min: 50,
            max: 500,
            fractionDigits: 2,
          });
          const maintenance: Partial<ComputerMaintenance> = {
            computerId: computer.id,
            maintenanceDate,
            cost,
            userId: assignment.userId,
            description: faker.helpers.arrayElement(maintenanceDescriptions),
            createdAt: maintenanceDate,
            updatedAt: maintenanceDate,
          };
          maintenances.push(maintenance);
        }
        await this.maintenanceRepository.save(maintenances);
      }
      return {
        message: `Successfully seeded ${finalComputerCount} computers and related entities.`,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}

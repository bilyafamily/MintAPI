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
  REGIONS,
  SECTORS,
  DEPARTMENTS,
} from '../../data/seed.data';
import { User } from '../../user/entities/user.entity';
import { Location } from '../../location/entities/location.entity';
import { Region } from '../../location/entities/regiion.entity';
import { Sector } from './sector.entity';
import { Subcategory } from '../../subcategory/entities/subcategory.entity';
import { Agent } from '../../agent/entities/agent.entity';
import { Department } from 'src/common/entities/Department';
import { Ticket } from 'src/ticket/entities/ticket.entity';

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

  async seed() {
    // await this.seedTickets();
    await this.departments();
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

  async departments() {
    const data = await this.departmentRepository.find();

    if (data.length <= 0) {
      await this.departmentRepository.save(DEPARTMENTS);
    }
  }

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
}

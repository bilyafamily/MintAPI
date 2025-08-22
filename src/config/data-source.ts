import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './typeorm';

const dataSource = new DataSource(config as DataSourceOptions);

export default dataSource;

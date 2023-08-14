import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;
}

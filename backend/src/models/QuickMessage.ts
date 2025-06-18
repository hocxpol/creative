import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement
} from "sequelize-typescript";
import path from "path";

import Company from "./Company";
import User from "./User";

@Table
class QuickMessage extends Model<QuickMessage> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  shortcode: string;

  @Column
  message: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  visibility: string; // 'all' | 'me'

  @BelongsTo(() => Company)
  company: Company;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  get mediaPath(): string | null {
    if (this.getDataValue("mediaPath")) {
      const baseUrl = process.env.BACKEND_URL?.replace(/\/$/, "");
      const port = process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : "";
      const mediaPath = this.getDataValue("mediaPath").replace(/^\//, "");
      
      return `${baseUrl}${port}/public/quickMessage/${mediaPath}`;
    }
    return null;
  }
  
  @Column
  mediaName: string;
}

export default QuickMessage;

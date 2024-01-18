// NB - WIP

import { RowDataPacket } from "mysql2";
import { pool } from "../../src/helper/external/db";

const main = async (createdDate: string) => {
  // get all free shares

  const connection = await pool.getConnection();

  // assuming we have access to broker db to perform this query
  // - else would need to query via broker API and do application-level join of order against our db
  // ideally use a SPROC for this. Use pagination (use WHERE to paginate, not OFFSET)
  const query = `
        SELECT o.account_id, o.created_date FROM 
        order o inner join free_share fs on o.order_id = fs.order_id
        WHERE
             o.status = 'failed' and o.created_date > ?
        AND 
            o.created_date < NOW() - INTERVAL 1 HOUR 
        ORDER BY o.created_date ASC
        LIMIT 100;
    `;
  const data = await connection.query<
    ({
      order_id: string;
      account_id: string;
      created_date: string;
    } & RowDataPacket)[]
  >(query, [createdDate]);

  const updateFreeShareStatement = `
        UPDATE user SET free_share_status = 'eligible' where id in ?
    `;
  await connection.query(query, [data[0].map((o) => o.account_id)]);
};

package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface members_m extends BaseMapper<members_e> {
    @Insert("INSERT INTO members(id, tel, update_time) VALUES (#{id},#{tel},CURRENT_TIMESTAMP)")
    Boolean InsertMember(Long id, Long tel);

    @Select("SELECT id, tel, score, create_time, update_time from members where cast(tel as text) like '%${tel}%' limit #{limit} offset #{offset}")
    @Result(column = "create_time", property = "create_time")
    @Result(column = "update_time", property = "update_time")
    List<members_e> SelectLike(Long tel, int offset, int limit);

    @Select("SELECT count(*) from members where cast(tel as text) like '%${tel}%'")
    Long SelectLikeCount(Long tel);
}

import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ListArticlesQuery } from './dto/list-articles.query';
import { PopularQuery } from './dto/popular.query';
import { RandomQuery } from './dto/random.query';

// Public: news is non-sensitive RSS content and must be readable by logged-out
// viewers of shared newspapers.
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articles: ArticlesService) {}

  @Get('sources')
  sources() {
    return { sources: this.articles.sourcesList() };
  }

  @Get('popular')
  async popular(@Query() query: PopularQuery) {
    const articles = await this.articles.popular(query.limit ?? 8);
    return { articles, total: articles.length };
  }

  @Get('random')
  async random(@Query() query: RandomQuery) {
    const articles = await this.articles.random(query.count ?? 5);
    return { articles, total: articles.length };
  }

  @Get()
  async list(@Query() query: ListArticlesQuery) {
    const limit = query.limit ?? 20;
    if (query.sourceId) {
      const source = this.articles
        .sourcesList()
        .find((s) => s.id === query.sourceId);
      if (!source) {
        throw new NotFoundException(`Source '${query.sourceId}' not found`);
      }
      const articles = await this.articles.listBySource(query.sourceId, limit);
      return { articles, source };
    }
    const articles = await this.articles.listAll(limit);
    return { articles, total: articles.length };
  }
}

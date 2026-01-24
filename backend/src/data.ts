import fs from 'fs';
import path from 'path';
import { Category, SubCategory, Topic } from './types';

const DATA_DIR = path.join(__dirname, '..', 'data');

export function loadData(): Category[] {
    const categories: Category[] = [];
    
    if (!fs.existsSync(DATA_DIR)) {
        console.warn(`Data directory not found: ${DATA_DIR}`);
        return categories;
    }

    const categoryDirs = fs.readdirSync(DATA_DIR);

    for (const catName of categoryDirs) {
        const catPath = path.join(DATA_DIR, catName);
        if (!fs.statSync(catPath).isDirectory()) continue;

        const category: Category = {
            name: catName,
            subcategories: []
        };

        const subCatDirs = fs.readdirSync(catPath);
        for (const subCatName of subCatDirs) {
            const subCatPath = path.join(catPath, subCatName);
            if (!fs.statSync(subCatPath).isDirectory()) continue;

            const subcategory: SubCategory = {
                name: subCatName,
                topics: []
            };

            const topicFiles = fs.readdirSync(subCatPath);
            for (const topicFile of topicFiles) {
                if (!topicFile.endsWith('.json')) continue;
                
                const topicPath = path.join(subCatPath, topicFile);
                try {
                    const content = fs.readFileSync(topicPath, 'utf8');
                    const parsed = JSON.parse(content);
                    
                    if (Array.isArray(parsed)) {
                        subcategory.topics.push(...parsed);
                    } else {
                        subcategory.topics.push(parsed);
                    }
                } catch (e) {
                    console.error(`Error loading topic ${topicPath}:`, e);
                }
            }

            if (subcategory.topics.length > 0) {
                category.subcategories.push(subcategory);
            }
        }

        if (category.subcategories.length > 0) {
            categories.push(category);
        }
    }

    return categories;
}

export const CATEGORIES = loadData();

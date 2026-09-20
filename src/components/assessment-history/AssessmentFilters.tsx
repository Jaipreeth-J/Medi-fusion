/**
 * ASSESSMENT FILTERS COMPONENT
 * Filter controls for assessment history
 */

import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type AssessmentTypeFilter = 'all' | 'weekly_insight' | 'chat_assessment';
export type RiskLevelFilter = 'all' | 'low' | 'moderate' | 'high';

interface AssessmentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: AssessmentTypeFilter;
  onTypeChange: (value: AssessmentTypeFilter) => void;
  riskFilter: RiskLevelFilter;
  onRiskChange: (value: RiskLevelFilter) => void;
  showEmergencyOnly: boolean;
  onEmergencyToggle: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function AssessmentFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  riskFilter,
  onRiskChange,
  showEmergencyOnly,
  onEmergencyToggle,
  onClearFilters,
  hasActiveFilters,
}: AssessmentFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as AssessmentTypeFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="weekly_insight">Weekly Insights</SelectItem>
            <SelectItem value="chat_assessment">Chat Assessments</SelectItem>
          </SelectContent>
        </Select>

        {/* Risk Level Filter */}
        <Select value={riskFilter} onValueChange={(v) => onRiskChange(v as RiskLevelFilter)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
            <SelectItem value="moderate">Moderate Risk</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showEmergencyOnly ? 'default' : 'outline'}
          size="sm"
          onClick={onEmergencyToggle}
          className="h-7 text-xs"
        >
          🚨 Emergency Only
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
        
        {/* Active filter badges */}
        {typeFilter !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            Type: {typeFilter.replace('_', ' ')}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => onTypeChange('all')}
            />
          </Badge>
        )}
        {riskFilter !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            Risk: {riskFilter}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => onRiskChange('all')}
            />
          </Badge>
        )}
      </div>
    </div>
  );
}

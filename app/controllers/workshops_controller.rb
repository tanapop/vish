# Copyright 2011-2012 Universidad Politécnica de Madrid and Agora Systems S.A.
#
# This file is part of ViSH (Virtual Science Hub).
#
# ViSH is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# ViSH is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with ViSH.  If not, see <http://www.gnu.org/licenses/>.

class WorkshopsController < ApplicationController

  before_filter :authenticate_user!, :only => [ :new, :create, :edit, :update]
  before_filter :fill_create_params, :only => [:new, :create]

  include SocialStream::Controllers::Objects

  #############
  # REST methods
  #############

  def index
    super
  end

  def show
    show! do |format|
      format.html {
        if @workshop.draft and (can? :edit, @workshop)
          redirect_to edit_workshop_path(@workshop)
        else
          # @resource_suggestions = RecommenderSystem.resource_suggestions(current_subject,@excursion,{:n=>16, :models => [Workshop]})
          @resource_suggestions = RecommenderSystem.resource_suggestions(current_subject,@excursion,{:n=>16, :models => [Workshop,Excursion,Document]})
          render
        end
      }
    end
  end

  def new
    new! do |format|
      format.any { 
        render 'new'
      }
    end
  end

  def edit
    edit! do |format|
      format.any
    end
  end

  def create
    super do |format|
      format.json { 
        render :json => resource 
      }
      format.js
      format.all {
        if resource.new_record?
          render action: :new
        else
          redirect_to edit_workshop_path(resource) || home_path
        end
      }
    end
  end

  def update
    super
  end

  def destroy
    destroy! do |format|
      format.all { redirect_to user_path(current_subject) }
    end
  end


  private

  def allowed_params
    [:language, :age_min, :age_max, :scope, :avatar, :tag_list=>[]]
  end

  def fill_create_params
    params["workshop"] ||= {}
    params["workshop"]["scope"] ||= "0" #public
    unless current_subject.nil?
      params["workshop"]["owner_id"] = current_subject.actor_id
      params["workshop"]["author_id"] = current_subject.actor_id
      params["workshop"]["user_author_id"] = current_subject.actor_id
    end
  end

end